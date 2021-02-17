import { Dispatch } from 'redux';
import { DEFAULT_ALIAS, DEFAULT_URI, REDUCER_NAME } from './const';
import { State } from './type';
import updateStore from './updateStore';

interface ActionConfig<T> {
  type: string;
  alias?: string;
  uri?: string;

  reducer: (params: { state: T }) => T;
}

export default function createAction<T, PT, P extends Array<PT>>(
  action: (...args: P) => ActionConfig<T>,
) {
  function actionCreator(...params: P): any {
    const config = action(...params);
    return (dispatch: Dispatch, getStore: () => { [REDUCER_NAME]: State }) => {
      const state = getStore()[REDUCER_NAME];

      const alias = config.alias || DEFAULT_ALIAS;
      let uri = config.uri;
      if (!uri) {
        uri = state.getIn(['data', config.type, alias, '__active__']);
      }
      if (!uri) {
        uri = DEFAULT_URI;
      }
      const newData = config.reducer({
        state: state.getIn(['data', config.type, alias, uri]),
      });
      dispatch(
        updateStore({
          type: config.type,
          alias,
          uri,
          ...newData,
        }),
      );
    };
  }

  return actionCreator;
}
