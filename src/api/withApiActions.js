import PropTypes from 'prop-types';
import { compose } from 'redux';
import { getContext, mapProps } from 'recompose';

import * as ApiActions from './apiActions';
import bindActionCreators from './../redux/bindActionCreators';

export default compose(
  getContext({ store: PropTypes.object.isRequired }),
  mapProps(({ store, ...props }) => {
    return {
      ...props,
      apiActions: bindActionCreators(ApiActions, store.dispatch),
    };
  }),
);
