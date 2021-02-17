import _defaultsDeep from 'lodash-es/defaultsDeep';
import _get from 'lodash-es/get';
import getHistory from './../../history/createApplicationHistory';
import { isInArray } from './../common';
import { STATUS_OK, STATUS_REDIRECT } from './../const';
import buildAPIUrl from './buildAPIUrl';
import normalizeUrl from './normalizeUrl';
import detectRedirect from './_detectRedirect';
import guessRedirectUrl from './_guessRedirectUrl';

export default (url, options = {}) => {
  /**
     |-----------------------------------------------------------
     | https://stackoverflow.com/questions/21177387/caution-provisional-headers-are-shown-in-chrome-debugger?rq=1
     |-----------------------------------------------------------
     */
  options = _defaultsDeep(
    {
      credentials: 'include',
      headers: {
        'x-requested-with': 'XMLHttpRequest',
        platform: 'web',
      },
    },
    options,
  );
  if (options.disableXMLHttpRequest) {
    delete options.headers['x-requested-with'];
  }
  // Handle JSON format data
  const method = (options.method || '').toLowerCase();
  if (options.body && ['post', 'put'].indexOf(method) !== -1) {
    if (__SERVER__) {
      //TODO: use "form-data" package in SERVER
      /*
      if (
        typeof options.body === 'object' &&
        !(options.body instanceof window.FormData)
      ) {
        console.log(options.body);
        options.body = JSON.stringify(options.body);
      } */
    } else {
      if (
        typeof options.body === 'object' &&
        !(options.body instanceof window.FormData)
      ) {
        if (options.formUrlEncoded) {
          options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        } else {
          options.body = JSON.stringify(options.body);
        }
      }
    }
    if (typeof options.body === 'string') {
      options.headers['Accept'] = 'application/json, text/plain, */*';
      options.headers['Content-Type'] = 'application/json';
    }
  }
  return fetch(buildAPIUrl(url), options).then((res) => {
    if (res.status >= 500) {
      return Promise.reject(res);
    }
    if (res.status >= 400) {
      throw new Error('API return status >=400');
    }
    /**
       |-----------------------------------------------------------------------
       | Detect if user try to redirect by header
       |-----------------------------------------------------------------------
       */
    if (detectRedirect(res)) {
      const redirect = guessRedirectUrl(res);
      /**
         |-----------------------------------------------------------------------
         | Phai doi resolve roi moi redirect de tranh leak memory
         |-----------------------------------------------------------------------
         */
      if (redirect) {
        window.location.href = normalizeUrl(redirect);
        return new Promise((resolve) => {});
      }
    }
    return res.json().then(
      (body) => {
        const redirect = _get(body, 'result.meta_data.redirect');
        const statusCode = _get(body, 'status.code', STATUS_OK);
        if (redirect && isInArray(STATUS_REDIRECT, statusCode)) {
          // 2. Redirect from APP
          const hasProtocol = /^https?:\/\//.test(redirect);
          if (hasProtocol) {
            window.location.href = normalizeUrl(redirect, true);
            if (__SERVER__) {
              return Promise.reject(body);
            }
            return new Promise((resolve) => {});
          } else {
            const history = getHistory();
            history.push(normalizeUrl(redirect));
            return Promise.reject(body);
          }
        }
        if (statusCode >= 400) {
          return Promise.reject(body);
        }
        return Promise.resolve(body);
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  });
};
