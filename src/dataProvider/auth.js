import _get from 'lodash-es/get';
import {
  createFetchAction,
  createGetter,
  DEFAULT_ALIAS,
  DEFAULT_URI,
} from '../redux';
import API from '../services/API';
import {
  CONTENT_TYPE,
  JWT_COOKIE_NAME,
  LOGIN_TYPE_COOKIE_NAME,
  LOGIN_TYPE_USERNAME,
} from './../helpers/const';
import * as Cookies from './../helpers/cookie';
import { pageHistory } from './history';

export const TYPE = '@AUTH';

export const loginByUsernameAction = {
  name: 'loginByUsername',
  service: API,
  deps: [pageHistory],
  params: (params) => ({
    method: 'POST',
    entry: 'uaa/oauth/token',
    body: params.payload,
    contentType: CONTENT_TYPE.FORM_DATA,
  }),
  onPending: () => {},
  onError: () => {},
  onResponse: (resp, current, params, ...rest) => {
    if (!resp) throw new Error();
    const accessToken = _get(resp, 'access_token');
    Cookies.set(LOGIN_TYPE_COOKIE_NAME, LOGIN_TYPE_USERNAME);
    Cookies.set(JWT_COOKIE_NAME, accessToken);
    const authData = {
      data: {
        accessToken,
        refreshToken: _get(resp, 'refresh_token'),
      },
    };
    if (typeof params.onLoginSuccessCallback === 'function') {
      params.onLoginSuccessCallback(authData);
    }
    return [
      authData,
      // show toast
      // hide loading
    ];
  },
};

export const authConfig = {
  type: TYPE,
  alias: DEFAULT_ALIAS,
  default: {},
  uri: DEFAULT_URI,
  actions: [
    loginByUsernameAction,
    // loginByFacebookAction,
    // loginByGoogleAction,
    // registerAction,
    // logoutAction,
  ],
};

export const useAuthGetter = createGetter(authConfig);
export const useAuthActions = createFetchAction(authConfig);
