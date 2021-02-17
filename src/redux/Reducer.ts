import { from } from 'seamless-immutable';
import { Action } from 'redux';

import { MutableState, StoreUpdateAction } from './type';
import { getObservedBitsFromNames } from './helpers';

const initialAppState = from<MutableState>({
  data: {},
  observedBits: 0,
});

function isUpdateStore(action: Action<any>): action is StoreUpdateAction {
  return action.type === '@@action/UPDATE_STORE';
}

export default function(state = initialAppState, action: Action<any>) {
  if (isUpdateStore(action)) {
    return action.payload.reduce((state, path) => {
      const dataPath = ['data', path.type, path.alias, path.uri];
      const activeDataPath = ['data', path.type, path.alias, '__active__'];
      const version = state.getIn(dataPath.concat('version'), 0);
      return state
        .setIn(dataPath, {
          data: path.data,
          status: path.status,
          meta: path.meta,
          version: version + 1,
        })
        .setIn(activeDataPath, path.uri);
    }, state.set('observedBits', action.observedBits));
  }
  // copy data from old version

  if (
    action.type === '@data-fetcher/SUCCESS' ||
    action.type === '@data-fetcher/FAILED' ||
    action.type === '@data-fetcher/RESTORE'
  ) {
    const response = (action as any).response;
    const types = Object.keys(response);
    const observedBits = getObservedBitsFromNames(types);
    return types.reduce((state, type) => {
      const alias = Object.keys(response[type])[0];
      const payload = response[type][alias];
      const dataPath = ['data', type, '_', '_'];
      const activeDataPath = ['data', type, '_', '__active__'];
      const version = state.getIn(dataPath.concat('version'), 0);
      return state
        .setIn(dataPath, {
          data: payload.data,
          status: payload.status,
          meta: payload.metaData,
          version: version + 1,
        })
        .setIn(activeDataPath, '_');
    }, state.set('observedBits', observedBits));
  }
  return state;
}
