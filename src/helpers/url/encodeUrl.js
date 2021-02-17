import _get from 'lodash-es/get';

export default (url = null) => {
  if (!url) return encodeURIComponent(_get(window, 'location.href'));
  return encodeURIComponent(url);
};
