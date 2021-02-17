import { getLocation } from '../base';
import serverBaseDomain from './serverBaseDomain';

export default (withDot = false) => {
  const location = getLocation();
  const hostname = location.hostname;
  return serverBaseDomain(hostname, withDot);
};
