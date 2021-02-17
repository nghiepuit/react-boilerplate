import { Strategy, DATA_STATUS } from './type';

export const fetchIfNotFound: Strategy<any, any> = {
  shouldFetch(getter) {
    return (
      getter.depsStatus > DATA_STATUS.PENDING &&
      getter.current.status === DATA_STATUS.INIT
    );
  },
};
