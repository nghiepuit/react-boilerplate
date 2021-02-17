export default (uiStateNames, initialState, options) => {
  return {
    getUIStateName:
      uiStateNames instanceof Function
        ? props => uiStateNames(props)
        : () => uiStateNames,
    getInitialState:
      initialState instanceof Function ? initialState : () => initialState,
    options,
  };
};
