import { bindActionCreators } from 'redux';
import _memoize from './../helpers/memoize';

export default _memoize((actionCreator, dispatch) =>
  bindActionCreators(actionCreator, dispatch),
);
