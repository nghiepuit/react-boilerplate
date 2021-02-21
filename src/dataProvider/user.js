import API from '../services/API';
import { createGetter, DATA_STATUS } from './../redux';

export const TYPE = 'USER';
export const ALIAS = '_';

export const userDataConfig = {
  type: TYPE,
  alias: ALIAS,
  default: null,
  service: API,
  uri: () => {
    return true;
  },
  params: (params) => ({
    method: 'GET',
    entry: 'user/userprofile/getFullUserContext',
    parse: (resp) => {
      console.log(resp);
      return resp;
    }
  }),
  onPending: (...rest) => {
    return {};
  },
  onError: () => {
    return {
      data: {},
      meta: {},
      status: DATA_STATUS.ERROR,
    };
  },
  onResponse: (resp, current, params, ...rest) => {
    console.log('resp: ', resp);
    return null;
  },
};

export const useUserData = createGetter(userDataConfig);
