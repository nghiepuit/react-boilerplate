import Cookies from 'js-cookie';
import { MAX_COOKIE_EXPIRED } from './../helpers/const';
import getBaseDomain from './../helpers/url/getBaseDomain';

export const get = (name) => {
  return Cookies.get(name);
};

/**
 * Set a cookie given name and value
 * - Co 2 gia tri cua options là: Secure & HttpOnly can dc can nhac cho nay.
 *  - Tuy nhien neu ung dung da co the HttpOnly thi dau server se handle
 *  - Chung ta chi can withCredentail option khi send API ve server la dc.
 * - Cho phep khong truyen domain vao thi su dung domain hien tai.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 */
export function set(name, value, options = {}) {
  options = {
    domain: getBaseDomain(true),
    expires: MAX_COOKIE_EXPIRED,
    path: '/',
    ...options,
  };
  if (options.hasOwnProperty('domain') && !options.domain) {
    delete options.domain;
  }
  return Cookies.set(name, value, options);
}

export const remove = (name, options = {}) => {
  options = {
    domain: getBaseDomain(true),
    path: '/',
    ...options,
  };
  if (options.hasOwnProperty('domain') && !options.domain) {
    delete options.domain;
  }
  return Cookies.remove(name, options);
};
