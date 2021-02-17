import qs from 'query-string';
import normalizeUrl from './normalizeUrl';

export default (search = {}) => {
  return normalizeUrl('tim-kiem?' + qs.stringify(search));
};
