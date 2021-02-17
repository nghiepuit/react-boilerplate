import { CALL_HISTORY_METHOD } from './../actions/history';

export default (history) => (store) => (next) => (action) => {
  if (action.type !== CALL_HISTORY_METHOD) {
    return next(action);
  }
  try {
    const {
      payload: { method, args },
    } = action;
    history[method](...args);
  } catch (error) {
    return error;
  }
};
