import _startsWith from 'lodash/startsWith';
export default url => {
  return _startsWith(url, 'http');
};
