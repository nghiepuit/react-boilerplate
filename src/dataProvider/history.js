import { createGetter } from './../redux';

export const globalHistory = {
  type: 'GlobalHistory',
  alias: '_',
  default: {
    query: {},
    params: {},
  },
};

export const pageHistory = {
  type: 'History',
  alias: '_',
  default: {
    query: {},
    params: {},
  },
};

export const useGlobalHistoryGetter = createGetter(globalHistory);
export const usePageHistoryGetter = createGetter(pageHistory);
