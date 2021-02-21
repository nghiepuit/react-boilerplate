import _identity from 'lodash-es/identity';
import _pickBy from 'lodash-es/pickBy';
import qs from 'query-string';
import fetchWithTimeout from '../api/fetchWithTimeout';
import { CONTENT_TYPE, JWT_COOKIE_NAME } from '../helpers/const';
import buildToFormData from '../helpers/url/buildToFormData';
import * as Cookies from './../helpers/cookie';

const APIParser = async (response) => {
  let httpStatus = null;
  let body = null;
  try {
    const data = await response.json();
    if (data) {
      httpStatus = 200;
      body = data;
    } else {
      httpStatus = 500;
    }
  } catch (ex) {
    httpStatus = 500;
  }
  return {
    status: httpStatus,
    body,
  };
};

export default {
  fetch(params, onPending, onResponse, onError) {
    onPending();
    if (!params) {
      throw new Error('[API] can not fetch without params');
    }
    const domain = process.env.APP_FUNDOO_API_DOMAIN || '';
    const query =
      (params.query &&
        '?' +
          qs.stringify(params.query, {
            arrayFormat: 'comma',
            ...params.queryOptions,
          })) ||
      '';
    const apiEntryPoint = `${domain}/${params.entry}${query}`;

    const jwt = Cookies.get(JWT_COOKIE_NAME);
    if (!jwt || jwt === 'undefined' || jwt === 'null') {
      jwt = '';
    }
    const defaultHeaders = {
      authorization: `Bearer ${jwt}`,
    };
    const headers = params.headers || defaultHeaders;
    let body = params.body && JSON.stringify(params.body);
    if (params.contentType === CONTENT_TYPE.FORM_DATA) {
      body = buildToFormData(params.body);
    }

    const args = _pickBy(
      {
        // credentials: 'include',
        headers,
        method: params.method || 'GET',
        body,
      },
      _identity,
    );

    return fetchWithTimeout(apiEntryPoint, args)
      .then(params.parse || APIParser)
      .then(onResponse)
      .catch((error) => {
        if (onError) {
          onError(error, null);
        } else {
          throw error;
        }
      });
  },
};
