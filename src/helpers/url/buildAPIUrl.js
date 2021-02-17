import qs from 'query-string';
import _isEmpty from 'lodash-es/isEmpty';
import normalizeUrl from './normalizeUrl';

export default (url, query, queryOptions) => {
  let _search = { ...query };
  if (!_isEmpty(_search)) {
    if (typeof queryOptions === 'undefined') {
      for (let key in _search) {
        if (Array.isArray(_search[key])) {
          _search[key] = _search[key].join(',');
        }
      }
      return normalizeUrl(url, true, false) + '?' + qs.stringify(_search);
    } else {
      return (
        normalizeUrl(url, true, false) +
        '?' +
        qs.stringify(_search, queryOptions)
      );
    }
  }
  return normalizeUrl(url, true, false);
};
