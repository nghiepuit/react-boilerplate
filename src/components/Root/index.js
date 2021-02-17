import _get from 'lodash-es/get';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import ConnectHistory from './../../components/ConnectHistory';
import { deviceInfo } from './../../helpers/common';
import * as Cookie from './../../helpers/cookie';
import RootLayout from './RootLayout';

const checkIsFromExoRoute = (prevRouteName, nextRouteName) => {
  if (
    prevRouteName === nextRouteName ||
    (!!isExoRoute[prevRouteName] && !!isExoRoute[nextRouteName])
  ) {
    return false;
  }

  return !!isExoRoute[prevRouteName] || !!isExoRoute[nextRouteName];
};

class Root extends PureComponent {
  static propTypes = {
    routes: PropTypes.array.isRequired,
    history: PropTypes.object,
    location: PropTypes.string,
  };

  static defaultProps = {
    history: null,
    location: null,
  };

  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    if (process.env.NODE_ENV === 'production') {
      const _gid = Cookie.get('_gid');
      const delay = !!_gid ? 2000 : 7000;
      setTimeout(() => {
        // TODO: implement gtm & ga
      }, delay);
    }

    // Generate tracking_id
    // TODO: implement tracking

    if (window.__FIRST_LOAD__) {
      delete window.__FIRST_LOAD__;
    }
    this.bodyClassnames();
  }

  beforeLocationChange = ({ nextHistory, prevHistory }) => {
    if (!__CLIENT__) return true;
    const {
      pathname: nextPathname,
      search: nextSearch,
      query: nextQuery,
      params: nextParams,
      routeName: nextRouteName,
    } = nextHistory;

    const { routeName: prevRouteName } = prevHistory;

    // to replace (not push) when redirect from external page
    const shouldReplacementRoute = checkIsFromExoRoute(
      prevRouteName,
      nextRouteName,
    );

    if (window.__isHaveUpdate || shouldReplacementRoute) {
      document.location.replace(nextPathname + nextSearch);
      return false;
    }

    // Redirect Home page when at page search and q not exist
    if (
      searchRoutes[nextRouteName] &&
      this.isInvalidQuery(nextQuery, nextParams)
    ) {
      document.location.replace('/');
      return false;
    }

    return true;
  };

  bodyClassnames() {
    if (__SERVER__) return;
    let iphoneX = deviceInfo().isIphoneX();
    if (iphoneX && _get(window, 'document.body.classList', null)) {
      window.document.body.classList.add('iphone-x');
    }
  }

  render() {
    const { routes, history } = this.props;
    return (
      <RootLayout>
        <ConnectHistory
          beforeLocationChange={this.beforeLocationChange}
          history={history}
          routes={routes}
        />
      </RootLayout>
    );
  }
}

export default Root;
