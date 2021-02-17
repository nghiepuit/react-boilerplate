import { useContext, useState, useEffect, useReducer } from 'react';
import shallowEqual from 'react-redux/es/utils/shallowEqual';
import _get from 'lodash-es/get';

import {
  DataSource,
  DATA_STATUS,
  ConnectedData,
  GetterResult,
  State,
  DataSourceUri,
} from './type';
import { DEFAULT_URI, DEFAULT_ALIAS } from './const';

import DataProviderContext from './Context';
import { getObservedBitsFromNames } from './helpers';

function getUri<P, DT>(
  uri?: DataSourceUri<P, DT>,
  params?: P,
  deps?: ConnectedData<DT>[],
) {
  if (!uri) {
    return DEFAULT_URI;
  }
  if (typeof uri === 'string') {
    return uri;
  }
  return uri(params, deps);
}

export function getStoreValue<T, P, DT = any>(
  store: State,
  config: DataSource<T, P, DT>,
  params?: P,
): GetterResult<T, P> {
  const deps = Array.isArray(config.deps)
    ? (config.deps.map(
        (dep) => getStoreValue(store, dep).current,
      ) as ConnectedData<DT>[])
    : undefined;

  const depsStatus =
    deps && deps.length > 0
      ? deps.reduce((status, deps) => {
          if (deps.status < status) {
            return deps.status;
          }
          return status;
        }, DATA_STATUS.SUCCESS)
      : DATA_STATUS.SUCCESS;

  const uri =
    depsStatus === DATA_STATUS.SUCCESS
      ? getUri(config.uri, params, deps)
      : undefined;
  let state = undefined;
  if (uri) {
    state = _get(store, [
      'data',
      config.type,
      config.alias || DEFAULT_ALIAS,
      uri,
    ]);
  }

  if (!state) {
    return {
      current: {
        data: config.default,
        status: DATA_STATUS.INIT,
        meta: {},
        version: 0,
      },
      uri,
      params,
      depsStatus,
      deps,
    };
  }
  return {
    current: state,
    uri,
    params,
    depsStatus,
    deps,
  };
}

function createDefaultResult<T, P>(
  defaultData: T,
  params: P,
): GetterResult<T, P> {
  return {
    current: {
      __default__: true,
      status: DATA_STATUS.INIT,
      data: defaultData,
      meta: {},
      version: 0,
    },
    params,
    depsStatus: DATA_STATUS.INIT,
  };
}

function createUpdateParamsResult(config, actionParams, statedParams) {
  if (!statedParams && actionParams) {
    return true;
  }
  if (typeof config.shouldParamsUpdate === 'function') {
    return config.shouldParamsUpdate(statedParams, actionParams);
  }

  return false;
}

export default function createGetter<T, P, DT = any>(
  config: DataSource<T, P, DT>,
) {
  const names = ((config.deps && config.deps.map((c) => c.type)) || []).concat(
    config.type,
  );
  const observedBits = getObservedBitsFromNames(names);
  return (...args: P extends undefined ? [] : [P]): GetterResult<T, P> => {
    const context = useContext(DataProviderContext);
    if (context === null) {
      return createDefaultResult(config.default, args[0] as P);
    }
    const [state, dispatch] = useReducer(
      (
        state: GetterResult<T, P>,
        action: { type: string; store: State; params?: P },
      ) => {
        const newParams = action.params || state.params;
        const newState = getStoreValue(action.store, config, newParams);
        // at type === "PARAM_UPDATE"
        // we want to save params to state
        // at type === 'STORE_UPDATE'
        // we want to check new uri, notify component to update new data
        if (
          newState.uri !== state.uri ||
          newState.current.version !== state.current.version ||
          createUpdateParamsResult(config, action.params, state.params)
        ) {
          if (
            config.keepOldData &&
            newState.current.status === DATA_STATUS.INIT
          ) {
            return {
              ...newState,
              current: {
                ...newState.current,
                data: state.current.data,
                meta: {
                  ...newState.current.meta,
                  outdate: true,
                },
              },
            };
          }
          return newState;
        }

        return state;
      },
      args[0],
      (params) => {
        return getStoreValue(context.getState(), config, params);
      },
    );

    useEffect(() => {
      return context.subscribe(() => {
        const store = context.getState();
        dispatch({ type: 'STORE_UPDATE', store });
      });
    }, []);
    useEffect(() => {
      dispatch({
        type: 'PARAMS_UPDATE',
        store: context.getState(),
        params: args[0],
      });
    }, [args[0]]);

    return state;
  };
}
