import _get from 'lodash-es/get';
import identity from 'lodash-es/identity';
import _mapValues from 'lodash-es/mapValues';
import pickBy from 'lodash-es/pickBy';
import qs from 'query-string';
import { getLocation, getLocationV2 } from './../selectors/history';

export const CALL_HISTORY_METHOD = '@@history/CALL_HISTORY_METHOD';

function updateLocation(method) {
  return (...args) => ({
    type: CALL_HISTORY_METHOD,
    payload: { method, args },
  });
}

export const push = updateLocation('push');
export const replace = updateLocation('replace');
export const goBack = updateLocation('goBack');
export const goForward = updateLocation('goForward');

export const pushQuery = ({ query, merge, state, hash }) => {
  return (dispatch, getState) => {
    const store = getState();
    const location = getLocation(store);
    let newQuery = query;
    if (merge) {
      newQuery = _mapValues({ ...location.query, ...query }, (value) => {
        if (Array.isArray(value)) {
          return value.join(',');
        }
        return value;
      });
    }
    dispatch(
      push(
        location.pathname +
          '?' +
          qs.stringify(pickBy(newQuery, identity)) +
          _get(hash, '', ''),
        state,
      ),
    );
  };
};

export const replaceQuery = ({ query, merge, hash }) => {
  return (dispatch, getState) => {
    const state = getState();
    const location = getLocation(state);
    let newQuery = query;
    if (merge) {
      newQuery = _mapValues({ ...location.query, ...query }, (value) => {
        if (Array.isArray(value)) {
          return value.join(',');
        }
        return value;
      });
    }
    dispatch(
      replace(
        location.pathname +
          '?' +
          qs.stringify(pickBy(newQuery, identity)) +
          _get(hash, '', ''),
      ),
    );
  };
};

export const replaceQueryV2 = ({ query, merge, hash }) => {
  return (dispatch, getState) => {
    const state = getState();
    const location = getLocationV2(state);
    let newQuery = query;
    if (merge) {
      newQuery = _mapValues({ ...location.query, ...query }, (value) => {
        if (Array.isArray(value)) {
          return value.join(',');
        }
        return value;
      });
    }
    dispatch(
      replace(
        location.pathname +
          '?' +
          qs.stringify(pickBy(newQuery, identity)) +
          _get(hash, '', ''),
      ),
    );
  };
};

export const routerActions = {
  push,
  replace,
  goBack,
  goForward,
  pushQuery,
  replaceQuery,
  replaceQueryV2,
};
