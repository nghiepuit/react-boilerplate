import { getLocation } from '../base';

export default () => {
  if (__SERVER__) {
    return process.env.APP_BASE_DOMAIN;
  }
  const location = getLocation();
  const BASE_URL = location.protocol + '//' + location.host;
  return BASE_URL;
};
