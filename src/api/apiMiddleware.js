import _defaultsDeep from 'lodash-es/defaultsDeep';
import _get from 'lodash-es/get';
import _identity from 'lodash-es/identity';
import _omit from 'lodash-es/omit';
import _pickBy from 'lodash-es/pickBy';
import { JWT_COOKIE_NAME } from './../helpers/const';
import * as Cookie from './../helpers/cookie';
import buildAPIUrl from './../helpers/url/buildAPIUrl';
import normalizeUrl from './../helpers/url/normalizeUrl';
import { routerActions } from './../redux/actions/history';
import { API_CALL_ACTION } from './apiConstants';
import detectRedirect from './detectRedirect';
import fetchWithTimeout from './fetchWithTimeout';

function getFetchOptions(config) {
  const method = (config.method || 'GET').toLowerCase();
  var jwt = '';
  if (__CLIENT__) {
    jwt = Cookie.get(JWT_COOKIE_NAME);
  }
  if (!jwt || jwt === 'undefined' || jwt === 'null') {
    jwt = '';
  }

  const headers = config.noHeaders
    ? {}
    : _pickBy(
        {
          'x-requested-with': config.xRequestedWith || 'XMLHttpRequest',
          platform: config.platform,
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          Authorization: jwt,
          ...config.headers,
        },
        _identity,
      );

  let body = config.body;
  if (__SERVER__) {
    body = JSON.stringify(body);
  } else {
    if (body && ['post', 'put'].indexOf(method) !== -1) {
      if (!(body instanceof window.FormData)) {
        if (config.formUrlEncoded) {
          headers['Content-Type'] = 'application/x-www-form-urlencoded';
        } else {
          body = JSON.stringify(body);
        }
      }
    }
  }
  const options = _defaultsDeep({
    method,
    credentials: config.credentials || 'include',
    headers: headers,
    redirect: config.redirect || 'follow',
    body,
  });

  if (__SERVER__) {
    options.headers.Cookie = config.cookie;
  }
  if (options.method === 'get') {
    delete options.body;
  }
  return options;
}

async function defaultApiResponseNormalizer(apiResponse) {
  let httpStatus = { code: apiResponse.status };

  let body = null;
  try {
    body = await apiResponse.json();
    // If api return json
    if (body) {
      // mapi
      if (body.hasOwnProperty('status') && body.hasOwnProperty('result')) {
        httpStatus = body.status;
      } else {
        //checkout api
        body = { result: body };
      }
    }
  } catch (ex) {}
  return {
    status: httpStatus,
    body,
  };
}

export default (store) => (next) => (action) => {
  const type = action.type;
  if (type === API_CALL_ACTION) {
    const apiCallConfig = action.config;
    const reduxState = store.getState();
    const callbackActions = action.config.callbackActions || {};
    const pendingAction = callbackActions.pending;
    const successAction = callbackActions.success;
    const failedAction = callbackActions.failed;
    const redirectAction = callbackActions.redirect;

    const responseNormalizer =
      action.config.responseNormalizer || defaultApiResponseNormalizer;
    const onPending = action.config.onPending;
    const onResponse = action.config.onResponse;
    const onError = action.config.onError;
    const metaData = {
      name: apiCallConfig.name,
      id: apiCallConfig.id,
      componentAlias: apiCallConfig.componentAlias,
      trackingSessionKey: _get(reduxState, ['tracking', 'sessionKey']),
      reFetch: apiCallConfig.reFetch || false,
    };
    if (pendingAction) {
      let response = {};
      if (onPending instanceof Function) {
        response = onPending(next);
      }
      next({
        type: pendingAction,
        metaData,
        response,
      });
    }

    const apiEntryPoint = buildAPIUrl(
      apiCallConfig.url,
      apiCallConfig.query,
      apiCallConfig.queryOptions, // to build query (with qs)
    );
    const fetchOptions = getFetchOptions(apiCallConfig);

    return fetchWithTimeout(apiCallConfig.timeout, apiEntryPoint, fetchOptions)
      .then(async (apiResponse) => {
        //FIXME: hard code to reload window when logout
        //Fetch: manual redirect
        const normalizedApiResponse = await responseNormalizer(apiResponse);

        if (
          apiResponse.type === 'opaqueredirect' ||
          apiEntryPoint.indexOf('/dang-xuat') > -1
        ) {
          window.location.reload(true);
          return;
        }

        const httpStatus = _get(normalizedApiResponse, ['status'], 404);
        const httpBody = _get(normalizedApiResponse, ['body'], null);

        if (httpStatus.code >= 500) {
          throw {
            name: 'API_CALL_ERROR',
            status: apiResponse.status,
            body: httpBody,
          };
        }

        if (httpStatus.code >= 400) {
          throw {
            name: 'API_CALL_ERROR',
            status: normalizedApiResponse.status,
            body: httpBody,
          };
        }

        if (detectRedirect(httpStatus.code)) {
          const redirectLocation = _get(normalizedApiResponse, [
            'body',
            'result',
            'meta_data',
            'redirect',
          ]);
          if (!redirectLocation) {
            throw new Error({
              name: 'API_CALL_ERROR',
              status: normalizedApiResponse.status,
            });
          }
          if (__CLIENT__) {
            const hasProtocol = /^https?:\/\//.test(redirectLocation);
            if (hasProtocol) {
              window.location.href = normalizeUrl(redirectLocation, true);
              return new Promise((resolve) => {});
            } else {
              next(routerActions.replace(normalizeUrl(redirectLocation)));
            }
          }
          return next({
            type: redirectAction,
            redirectLocation,
          });
        }

        const contentType = apiResponse.headers.get('content-type');
        if (!contentType || contentType.indexOf('application/json') === -1) {
          throw {
            name: 'API_CALL_ERROR',
            status: apiResponse.status,
            body: httpBody,
            msg:
              'Response from "' +
              apiCallConfig.name +
              '" has unexpected "content-type"',
          };
        }

        if (successAction) {
          const response = next({
            type: successAction,
            response:
              onResponse instanceof Function
                ? await onResponse(
                    _get(normalizedApiResponse, ['body', 'result'], null),
                    next,
                  )
                : {},
            metaData,
            fetchOptions: {
              url: apiCallConfig.url,
              query: apiCallConfig.query,
              options: _omit(fetchOptions, ['headers']),
            },
          });
          if (__CLIENT__) {
            const responseCookies = _get(response, [
              'response',
              'PageMetaData',
              'active',
              'data',
              'cookie',
            ]);
            if (responseCookies) {
              responseCookies.map((setCookie) => {
                Cookie.set(setCookie.key, setCookie.value, {
                  ..._pickBy(
                    {
                      expires: setCookie.expires,
                      httpOnly: setCookie.httpOnly,
                      secure: setCookie.secure,
                      path: setCookie.path,
                    },
                    _identity,
                  ),
                  domain: undefined, //setCookie.domain ,
                });
              });
            }
          }
          return response;
        }
      })
      .catch((error) => {
        console.log('error', error);
        if (!failedAction && process.env.NODE_ENV !== 'production') {
          console.groupCollapsed(`Fetcher error: ${apiCallConfig.name}`);
          console.error(error);
          console.error(apiCallConfig);
          console.groupEnd();
        }

        if (failedAction) {
          return next({
            type: failedAction,
            response: onError instanceof Function ? onError(error, next) : {},
            metaData,
            error,
          });
        }
      });
  } else {
    return next(action);
  }
};
