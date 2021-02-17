import qs from 'query-string';
import UAParser from 'ua-parser-js';
import { matchPath } from 'react-router-dom';
import { isInApp } from './../../helpers/common';

const DEFAULT_WINDOW = {
  navigator: { userAgent: [] },
  location: {},
  document: {},
  remToPx: 10,
  innerWidth: __WAP__ ? 375 : 1368,
};

//TODO: The best way to remove this globalFunction
let __windowInstance = DEFAULT_WINDOW;
let __documentInstance = {};
let __navigatorInstance = { userAgent: [] };
if (__SERVER__) {
  Object.defineProperty(global, 'window', {
    get: () => {
      return __windowInstance;
    },
    enumerable: true,
  });
  Object.defineProperty(global, 'document', {
    get: () => {
      return __documentInstance;
    },
    enumerable: true,
  });
  Object.defineProperty(global, 'navigator', {
    get: () => {
      return __navigatorInstance;
    },
    enumerable: true,
  });
}

export const simulateClient = req => {
  const _window = { ...DEFAULT_WINDOW };
  var protocol = process.env.APP_PROTOCOL || req.get('X-Scheme') || 'https';
  if (protocol[protocol.length - 1] !== ':') {
    protocol += ':';
  }
  _window.navigator.userAgent = req.get('User-Agent');
  /**
   * @note: Express to chuc code cho nay khong giong va ko giong design cua browser
   * 1. De compatible voi trinh duyet,
   *    host cua trinh duyet la bao gom ca: hostname:port
   * 2. Trong khi cai hostname va host cua `req` la giong nhau.
   */
  _window.location = {
    protocol: protocol,
    host: req.get('host'), //Phai su dung tu header
    search: '?' + qs.stringify(req.query),
    pathname: req.path,
    hostname: req.host || req.hostname, //Su dung truc tiep cua request,
    href: req.protocol + '://' + req.get('host') + req.originalUrl,
  };
  _window.deviceInfo = UAParser(req.get('User-Agent')) || {};
  _window.__IN_APP__ = isInApp();
  // set cookie to document
  _window.document.cookie = req.headers.cookie;

  //TODO: The best way to remove this globalFunction
  __windowInstance = _window;
  __documentInstance = _window.document;
  __navigatorInstance = _window.navigator;

  return _window;
};

export const matchRoute = (path, routes) => {
  let matched = null;
  const route = routes.find(route => {
    matched = matchPath(path, route);
    return matched;
  });
  return { route, matched };
};
