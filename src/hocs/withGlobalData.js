import PropTypes from 'prop-types';
import { compose, getContext, setDisplayName, withContext } from 'recompose';

const contextType = {
  baseUrl: PropTypes.object.isRequired,
  window: PropTypes.object.isRequired,
};

export const withGlobalDataProvider = ({ globalData: { baseUrl }, window }) => {
  return compose(
    setDisplayName('GlobalDataProvider'),
    withContext(contextType, () => ({
      baseUrl,
      window,
    })),
  );
};
export default getContext(contextType);
