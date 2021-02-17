import getBaseUrl from './getBaseUrl';

export default res => {
  if (res.headers.get('location')) {
    return res.headers.get('location');
  }
  if (res.headers.get('x-location')) {
    return res.headers.get('x-location');
  }
  if (__CLIENT__) {
    return window.location.href;
  }
  return getBaseUrl();
};
