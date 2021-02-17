import qs from 'query-string';
import _pickBy from 'lodash-es/pickBy';
import _isNull from 'lodash-es/isNull';
import _isUndefined from 'lodash-es/isUndefined';
import normalizeUrl from './normalizeUrl';

export default (url, source_info = {}, absolute = false) => {
  url = normalizeUrl(url, absolute);
  let queryOld = qs.extract(url);
  let search = qs.parse(queryOld);
  source_info = _pickBy(source_info, value => {
    return !(_isNull(value) || _isUndefined(value));
  });
  var queryNew = qs.stringify({
    ...search,
    ...source_info,
  });
  if (!queryNew) {
    return url;
  }
  if (!queryOld) {
    return url + '?' + queryNew;
  }
  return url.replace(queryOld, queryNew);
};
