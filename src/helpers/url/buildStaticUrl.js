import _endsWith from 'lodash-es/endsWith';
import normalizeUrl from './normalizeUrl';

export default (path, query = {}) => {
  path = normalizeUrl(path, false, false);
  var PUBLIC_URL = process.env.PUBLIC_URL || '';
  if (_endsWith(PUBLIC_URL, '/')) {
    PUBLIC_URL = PUBLIC_URL.substr(0, PUBLIC_URL.length - 1);
  }
  return `${PUBLIC_URL}${path}`;
};
