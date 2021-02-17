import _indexOf from 'lodash-es/indexOf';
import { STATUS_REDIRECT } from './../helpers/const';

export default status => {
  if (status === 0) {
    return true;
  }
  if (_indexOf(STATUS_REDIRECT, status) > -1) {
    return true;
  }
  return false;
};
