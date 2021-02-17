import _get from 'lodash-es/get';

let cachedHistory = null;
export const getLocation = (state, forceNewHistoryKey = false) => {
  let nextHistory = _get(state, ['history'], {});
  if (forceNewHistoryKey && __CLIENT__) {
    if (cachedHistory && nextHistory.isNavigating) {
      return cachedHistory;
    }
    cachedHistory = nextHistory;
    return cachedHistory;
  }
  return nextHistory;
};

const REDUCER_NAME = '@';
const DEFAULT_ALIAS = '_';
const DEFAULT_URI = '_';

const pageHistory = {
  type: 'History',
  alias: DEFAULT_ALIAS,
  uri: DEFAULT_URI,
  default: {
    query: {},
    params: {},
  },
};

export const getLocationV2 = state =>
  _get(
    state,
    [
      REDUCER_NAME,
      'data',
      pageHistory.type,
      pageHistory.alias,
      pageHistory.uri,
      'data',
    ],
    {},
  );
