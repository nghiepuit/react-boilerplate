import _defaultsDeep from 'lodash-es/defaultsDeep';
import { JWT_COOKIE_NAME } from './../const';
import * as Cookies from './../cookie';
import fetchJSON from './fetchJSON';

export default (url, options = {}) => {
  var jwt = Cookies.get(JWT_COOKIE_NAME);
  if (!jwt || jwt === 'undefined' || jwt === 'null') {
    jwt = '';
  }
  /**
   |----------------------------------------------------------------
   | Bo sung 'x-requested-with': 'XMLHttpRequest' de work voi ham
   | /general/login/getSession/
   |----------------------------------------------------------------
   */
  options = _defaultsDeep(
    {
      headers: {
        Authorization: jwt,
      },
    },
    options,
  );
  return fetchJSON(url, options);
};
