import getBaseUrl from './getBaseUrl';

export default pathname => {
  if (/^https?:\/\//.test(pathname)) {
    return pathname;
  }
  let apiUrl = getBaseUrl() + process.env.APP_API_URL;
  if (pathname[0] !== '/') {
    apiUrl += '/';
  }
  apiUrl += pathname;
  return apiUrl;
};
