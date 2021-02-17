import qs from 'query-string';
import normalizeUrl from './normalizeUrl';

export default (query, shopAlias) => {
  return normalizeUrl(`shop/${shopAlias}/tim-kiem/?${qs.stringify(query)}`);
};
