import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import Immutable from 'seamless-immutable';
import apiMiddleware from './../api/apiMiddleware';
import uiReducer from './../dataProvider/uiState/uiReducer';
import getHistoryMiddleware from './middlewares/history';
import historyReducer from './reducers/history';

export const STORE_KEY = 'store';
// export const StoreProvider = createProvider(STORE_KEY);

export default (config) => {
  const { history, initialState, reducers, customMiddlewares = [] } = config;
  const historyMiddleware = getHistoryMiddleware(history);
  const middlewares = [
    apiMiddleware,
    historyMiddleware,
    thunk,
    ...customMiddlewares,
  ];

  const enhancers = [applyMiddleware(...middlewares)];
  if (process.env.APP_ENABLE_REDUX_DEV_TOOLS) {
    const composeWithDevTools = require('redux-devtools-extension')
      .composeWithDevTools;
    enhancers[0] = composeWithDevTools(applyMiddleware(...middlewares));
  }

  const immutableState = initialState
    ? Object.keys(initialState).reduce((finalState, key) => {
        finalState[key] = Immutable.from(initialState[key]);
        return finalState;
      }, {})
    : undefined;
  const store = createStore(
    combineReducers({
      ...reducers,
      history: historyReducer,
      uiState: uiReducer,
    }),
    immutableState,
    compose(...enhancers),
  );
  return store;
};
