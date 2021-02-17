import { useEffect, useContext } from 'react';
import _get from 'lodash-es/get';
import _pickBy from 'lodash-es/pickBy';
import _flatten from 'lodash-es/flatten';
import _identity from 'lodash-es/identity';

import { DataSource, GetterResult, RedirectData, DATA_STATUS } from './type';
import DataProviderContext from './Context';
import { fetchIfNotFound } from './Strategy';
import updateStore from './updateStore';

function getCookies(_data: any) {
  if (!_data) {
    return [];
  }
  let data = _data;
  if (!Array.isArray(data)) {
    data = [_data];
  }

  return _flatten(data.map((f) => _get(f, ['meta', 'cookie'])).filter(Boolean));
}

function checkRedirect(status: number, redirect?: string) {
  if ((status === 301 || status === 302) && !!redirect) {
    return [true, redirect];
  }
  return [false, ''];
}

export default function createFetcher<T, P, DT>(config: DataSource<T, P, DT>) {
  const strategy = config.strategy || fetchIfNotFound;
  return (getter: GetterResult<T, P>) => {
    const context = useContext(DataProviderContext);
    if (context === null) {
      return;
    }

    const isSSR =
      config.ssr && context.promiseCollecter && context.ignoreEffect === true;

    const cookie = context.getStorage('cookie');

    const fetchData = (params?: P, refetch?: boolean) => {
      if (getter.uri) {
        const uri = getter.uri;

        const getterParams =
          !!getter.params || !!params
            ? ({ ...getter.params, ...params } as P)
            : undefined;

        const shouldFetch = strategy.shouldFetch({
          ...getter,
          params: getterParams, // to send the newest params for custom shouldFetch strategy
        });

        const isFetch = shouldFetch || refetch;
        if (!isFetch) {
          const shouldRedirect = getter.current.status === DATA_STATUS.REDIRECT;
          if (shouldRedirect) {
            const { redirectUrl } = (getter.current.data || {}) as RedirectData;
            if (!redirectUrl) {
              return;
            }

            context.dispatch({
              type: '@@history/CALL_HISTORY_METHOD',
              payload: {
                method: 'replace',
                args: [redirectUrl],
              },
            });
          }
          return;
        }

        requestAnimationFrame(() => {
          const sessionKey = context.getSessionKey();
          const fetcherParams =
            typeof config.params === 'function'
              ? config.params(getterParams, getter.deps)
              : { ...config.params, ...params };
          config.service.fetch(
            fetcherParams,
            () => {
              if (!!config.onPending) {
                const data = config.onPending(
                  getter.current,
                  getterParams,
                  refetch,
                  getter.deps,
                  sessionKey,
                );
                data &&
                  context.dispatch(
                    updateStore(data, uri, config.type, config.alias),
                  );
              }
            },
            (res) => {
              try {
                const [redirect, redirectUrl] = checkRedirect(
                  res.status,
                  res.body.meta_data.redirect,
                ) as [boolean, string];
                if (redirect) {
                  if (redirectUrl.indexOf('http') > -1) {
                    window.location.href = redirectUrl;
                  } else {
                    const data = !config.onRedirect
                      ? {
                          data: { status: res.status, redirectUrl },
                          meta: {},
                          status: DATA_STATUS.REDIRECT,
                        }
                      : config.onRedirect(
                          res.body,
                          getter.current,
                          getterParams,
                          refetch,
                          getter.deps,
                          sessionKey,
                        );
                    if (data) {
                      context.dispatch(
                        updateStore(data, uri, config.type, config.alias),
                      );
                    }

                    context.dispatch({
                      type: '@@history/CALL_HISTORY_METHOD',
                      payload: {
                        method: 'replace',
                        args: [redirectUrl],
                      },
                    });
                  }
                  return;
                }

                if (res.status !== 200) {
                  throw new Error(
                    `[API ERROR] code:${res.status} - entry: ${fetcherParams.entry}`,
                  );
                }
                const data = config.onResponse(
                  res.body,
                  getter.current,
                  getterParams,
                  refetch,
                  getter.deps,
                  sessionKey,
                );

                const cookies: any[] = getCookies(data);
                if (cookie) {
                  cookies.map((setCookie) => {
                    cookie.set(
                      setCookie.key,
                      setCookie.value,
                      _pickBy(
                        {
                          expires: setCookie.expires,
                          httpOnly: setCookie.httpOnly,
                          path: setCookie.path,
                        },
                        _identity,
                      ),
                    );
                  });
                }

                data &&
                  requestAnimationFrame(() => {
                    context.dispatch(
                      updateStore(data, uri, config.type, config.alias),
                    );
                  });
              } catch (error) {
                if (!!config.onError) {
                  context.dispatch(
                    updateStore(
                      config.onError(
                        error,
                        getter.current,
                        getterParams,
                        refetch,
                        getter.deps,
                        sessionKey,
                      ),
                      uri,
                      config.type,
                      config.alias,
                    ),
                  );
                }
              }
            },
            (error) => {
              if (!!config.onError) {
                const data = config.onError(
                  error,
                  getter.current,
                  getterParams,
                  refetch,
                  getter.deps,
                  sessionKey,
                );
                data &&
                  context.dispatch(
                    updateStore(data, uri, config.type, config.alias),
                  );
              }
            },
            context,
          );
        });
      }
    };

    useEffect(() => fetchData(), [getter.uri]);

    if (!isSSR) {
      return (params?: P) => {
        return fetchData(params, true);
      };
    } else {
      if (getter.uri) {
        const uri = getter.uri;
        const shouldFetch = strategy.shouldFetch(getter);
        if (shouldFetch && context.promiseCollecter) {
          const sessionKey = context.getSessionKey();
          const fetcherParams =
            typeof config.params === 'function'
              ? config.params(getter.params, getter.deps)
              : { ...config.params, ...getter.params };
          if (context.renderResult && context.renderResult.fetchs) {
            context.renderResult.fetchs.push({
              service: config.service,
              onResponse: config.onResponse,
              params: fetcherParams,
              getter: getter,
              type: config.type,
              alias: config.alias,
            });
          }
          context.promiseCollecter.push(
            config.service.fetch(
              fetcherParams,
              () => {},
              (res) => {
                try {
                  const [redirect, redirectUrl] = checkRedirect(
                    res.status,
                    res.body.meta_data.redirect,
                  );

                  if (
                    res.status > context.renderResult.code &&
                    config.isPrimaryService
                  ) {
                    context.renderResult.code = res.status;
                  }
                  if (redirect) {
                    context.renderResult.redirectUrl = redirectUrl.toString();
                    context.renderResult.isRedirected = true;
                    return;
                  }

                  if (res.status !== 200) {
                    throw new Error(
                      `[API ERROR] code:${res.status} - entry: ${fetcherParams.entry}`,
                    );
                  }

                  const data = config.onResponse(
                    res.body,
                    getter.current,
                    getter.params,
                    false,
                    getter.deps,
                    sessionKey,
                  );
                  const cookies: any[] = getCookies(data);
                  if (cookie) {
                    if (context.renderResult && cookies.length) {
                      context.renderResult.isSetCookie = true;
                    }
                    cookies.map((setCookie) => {
                      cookie.set(
                        setCookie.key,
                        setCookie.value,
                        _pickBy(
                          {
                            expires: setCookie.expires,
                            httpOnly: setCookie.httpOnly,
                            path: setCookie.path,
                          },
                          _identity,
                        ),
                      );
                    });
                  }

                  context.dispatch(
                    updateStore(data, uri, config.type, config.alias),
                  );
                } catch (error) {
                  if (!!config.onError) {
                    context.dispatch(
                      updateStore(
                        config.onError(
                          error,
                          getter.current,
                          getter.params,
                          false,
                          getter.deps,
                          sessionKey,
                        ),
                        uri,
                        config.type,
                        config.alias,
                      ),
                    );
                  }
                }
              },
              (error) => {
                if (!!config.onError) {
                  if (config.isPrimaryService) {
                    context.renderResult.code = _get(error, 'status') || 500;
                  }
                  context.dispatch(
                    updateStore(
                      config.onError(
                        error,
                        getter.current,
                        getter.params,
                        false,
                        getter.deps,
                        sessionKey,
                      ),
                      uri,
                      config.type,
                      config.alias,
                    ),
                  );
                }
              },
              context,
            ),
          );
        }
      }
    }
  };
}

export async function handleFetchRequest({
  service,
  params,
  onResponse,
  getter,
  type,
  alias,
  sessionKey,
  cookie,
  context,
}) {
  return service
    .fetch(
      params,
      () => {},
      (res) => {
        const data = onResponse(
          res.body,
          getter.current,
          getter.params,
          false,
          getter.deps,
          sessionKey,
        );
        const cookies: any[] = getCookies(data);
        if (context.renderResult && cookies.length) {
          context.renderResult.isSetCookie = true;
        }
        cookies.map((setCookie) => {
          cookie.set(
            setCookie.key,
            setCookie.value,
            _pickBy(
              {
                expires: setCookie.expires,
                httpOnly: setCookie.httpOnly,
                path: setCookie.path,
              },
              _identity,
            ),
          );
        });
        return updateStore(data, getter.uri, type, alias);
      },
      () => {},
      context,
    )
    .catch((ex) => {});
}
