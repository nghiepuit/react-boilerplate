import Immutable from 'seamless-immutable';
export const LOCATION_CHANGE = '@@router/LOCATION_CHANGE';
export const LOCATION_CHANGED = '@@router/LOCATION_CHANGED';
const DATA_FETCHER_RESTORE = '@@DATA_FETCHER_RESTORE';

const initialState = Immutable.from({
  hash: null,
  key: null,
  pathname: null,
  routePath: null,
  routeName: null,
  state: null,
  query: {},
  search: '',
  params: {},
  action: null,
  historyLength: 0,
  isNavigating: true,
});

export default (state = initialState, { type, payload } = {}) => {
  switch (type) {
    case LOCATION_CHANGE: {
      const {
        hash,
        key,
        pathname,
        routeName,
        routePath,
        state: historyState,
        search,
        query,
        params,
        action,
        isNavigating,
      } = payload || {};
      let historyLength = state.historyLength;
      if (action === 'POP' && historyLength > 0) {
        historyLength -= 1;
      }
      if (action === 'PUSH') {
        historyLength += 1;
      }
      return Immutable.from({
        hash,
        key,
        pathname,
        routeName,
        routePath,
        state: historyState,
        query,
        search,
        params,
        action,
        historyLength,
        lastHistory: {
          pathname: state.pathname,
          search: state.search,
          query: state.query,
          params: state.params,
          action: state.action,
          routeName: state.routeName,
          routePath: state.routePath,
        },
        isNavigating,
      });
    }
    case DATA_FETCHER_RESTORE:
    case LOCATION_CHANGED: {
      return state.set('isNavigating', false);
    }
    default:
      return state;
  }
};
