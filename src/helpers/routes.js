import _isEmpty from 'lodash-es/isEmpty';
import { compile } from 'path-to-regexp';
import qs from 'query-string';

const __cachedCompiledPath = {};
const DOMAIN = process.env.APP_BASE_DOMAIN;

/* =============================
 * @Page Name
 */

export const PAGE_HOME_NAME = '@@fo/Home';
export const PAGE_FUNDOO_BOARD_NAME = '@@fo/FundooBoard';

export const HOME = {
  name: PAGE_HOME_NAME,
  domain: DOMAIN,
  path: '/',
  buildPath: buildPath(DOMAIN, '/'),
};

export const FUNDOO_BOARD = {
  name: PAGE_FUNDOO_BOARD_NAME,
  domain: DOMAIN,
  path: '/fundoo-board',
  buildPath: buildPath(DOMAIN, '/fundoo-board'),
};

/*=============================
 * @Returns
 */
// Returns Page Name
export const PAGE_RETURN_HOME = '@@ReturnRoute/PageHome';

const routeConfigs = {
  [HOME.name]: HOME,
  [FUNDOO_BOARD.name]: FUNDOO_BOARD,
};

/* =============================
 * Route name
 */
export const HOME_ROUTE_NAME = '@@Route/Home';
export const FUNDOO_BOARD_ROUTE_NAME = '@@Route/FundooBoard';
export const NOT_FOUND_ROUTE_NAME = '@@Route/NotFound';

/* ============================
 * Helpers
 */

function getCompiledPath(path) {
  if (!__cachedCompiledPath[path]) {
    __cachedCompiledPath[path] = compile(path);
  }
  return __cachedCompiledPath[path];
}

function buildPath(domain = '', path, isAbsolute = false) {
  let compiler = getCompiledPath(path);
  return function ({ data = null, query = null, options = {} } = {}) {
    let url = compiler(data, options);
    if (isAbsolute) {
      url = domain.concat(url);
    }
    if (domain !== process.env.APP_BASE_DOMAIN && !isAbsolute) {
      url = domain.concat(url);
    }
    if (!_isEmpty(query)) {
      url = url.concat('?', qs.stringify(query));
    }
    return url;
  };
}

export function buildPathFromPageName(pageName) {
  const route = routeConfigs[pageName];
  if (route) {
    return buildPath(route.domain, route.path, route.isAbsolute);
  } else {
    console.error(`[PageNotFound] ${pageName}`);
    return () => '/';
  }
}
