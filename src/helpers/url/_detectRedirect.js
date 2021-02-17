import { isInArray } from './../commons';
import { STATUS_REDIRECT } from './const';

export default res => {
  // Trong truong hop manually redirect
  if (res.type === 'opaqueredirect' && res.status === 0) {
    return true;
  }
  // Chua thay truong hop nay xay ra
  if (isInArray(STATUS_REDIRECT, res.status)) {
    return true;
  }
  return false;
};
