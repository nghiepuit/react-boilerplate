import Immutable from 'seamless-immutable';

export const INIT_NEW = '@@ui/INIT_NEW';
export const SET = '@@ui/SET';
export const PUSH_ITEM = '@@ui/PUSH_ITEM';
export const POP_ITEM = '@@ui/POP_ITEM';
export const REMOVE = '@@ui/REMOVE';

const initialState = Immutable.from({});

export default (state = initialState, action) => {
  switch (action.type) {
    case INIT_NEW: {
      const data = action.data || [];
      return data.reduce((newState, _action) => {
        const { payload, meta } = _action;
        const { uiStateName } = meta;
        const prevState = !!newState[uiStateName]
          ? newState[uiStateName]
          : Immutable.from({});

        if (!!state[uiStateName]) {
          return newState.set(
            uiStateName,
            Immutable.merge(prevState, [Immutable.from({ initialized: true })]),
          );
        }

        return newState.set(
          uiStateName,
          Immutable.merge(prevState, [
            Immutable.from(payload),
            Immutable.from({ initialized: true }),
          ]),
        );
      }, state);
    }
    case SET: {
      const { payload, meta } = action;
      const { uiStateName } = meta;
      return state.update(uiStateName, uiState =>
        !!uiState
          ? uiState.merge(Immutable.from(payload))
          : Immutable.from(payload),
      );
    }
    case PUSH_ITEM: {
      const { payload, meta } = action;
      const { uiStateName } = meta;
      const { key, value } = payload;
      return state.updateIn([uiStateName, key], array =>
        array.push(Immutable.from(value)),
      );
    }
    case POP_ITEM: {
      const {
        payload: { key },
        meta,
      } = action;
      const { uiStateName } = meta;
      return state.updateIn([uiStateName, key], array => array.pop());
    }
    case REMOVE: {
      const { meta } = action;
      const { uiStateName } = meta;
      return state.without(uiStateName);
    }
    default: {
      return state;
    }
  }
};
