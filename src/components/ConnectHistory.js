import _equal from 'lodash-es/isEqual';
import qs from 'query-string';
import React from 'react';
import { ReactReduxContext } from 'react-redux';
import { matchPath, __RouterContext as RouterContext } from 'react-router';
import removeXSS from './../helpers/xss/removeXSS';
import { actions, DATA_STATUS } from './../redux';
import { STORE_KEY } from './../redux/configureStore';
import { LOCATION_CHANGE } from './../redux/reducers/history';

export function getMatchRoute(pathName, routes) {
  return (routes || []).reduce(
    (result, config) => {
      if (!!result.match) {
        return result;
      }
      const match = matchPath(pathName, config);
      if (match) {
        return {
          config: config,
          match: match,
        };
      }
      return result;
    },
    {
      config: null,
      match: null,
    },
  );
}

function updateStore(type, data) {
  return actions.updateStore(
    {
      data,
      status: DATA_STATUS.SUCCESS,
      meta: {},
    },
    '_',
    type,
    '_',
    {
      observedBits: 0,
    },
  );
}

function initLocation(props, store) {
  const location = props.history.location;
  const route = getMatchRoute(location.pathname, props.routes);
  const { query } = qs.parseUrl(location.search);

  const data = {
    trackingOnly: true,
    key: location.key,
    hash: location.hash,
    pathname: location.pathname,
    search: location.search,
    state: location.state,
    action: 'PUSH',
    query: removeXSS(query),
    params: route.match.params,
    routePath: route.config.path,
    routeName: route.config.routeName,
    chunkName: route.config.chunkName,
    isNavigating: false,
    lastHistory: null,
    historyLength: 0,
  };

  store.dispatch(updateStore('History', data));
  store.dispatch(updateStore('GlobalHistory', data));
  store.dispatch({
    type: LOCATION_CHANGE,
    payload: data,
  });
  return route;
}

export default class ConnectHistory extends React.Component {
  static contextType = ReactReduxContext;

  constructor(props, context) {
    super(props);

    this.historyLength = 0;
    this.lastHistory = {};

    this.store = props.store || context[STORE_KEY];
    this.preloadRoute = {};

    let matchedRoute;
    if (__CLIENT__) {
      if (window.__FIRST_LOAD__) {
        matchedRoute = initLocation(props, this.store);
      }
    }
    this.state = {
      location: props.history.location,
      route:
        matchedRoute ||
        getMatchRoute(props.history.location.pathname, props.routes),
    };
  }

  componentDidMount() {
    this.unlisten = this.props.history.listen(this.onLocationChange);
  }

  shouldComponentUpdate(_, nextState) {
    return (
      nextState.location !== this.state.location ||
      nextState.route !== this.state.route
    );
  }

  componentWillUnmount() {
    this.unlisten();
  }

  onLocationChange = async (nextLocation, action, trackingOnly = false) => {
    const newRoute = getMatchRoute(nextLocation.pathname, this.props.routes);
    if (
      newRoute.config &&
      newRoute.config.routeName &&
      !this.preloadRoute[newRoute.config && newRoute.config.routeName]
    ) {
      try {
        this.preloadRoute[newRoute.config && newRoute.config.routeName] = true;

        await new Promise((resolve) => {
          let timeoutId = 0;
          newRoute.config.component.preload().then(() => {
            clearTimeout(timeoutId);
            resolve();
          });
          timeoutId = setTimeout(resolve, 200);
        });
      } catch (ex) {}
    }
    const { query } = qs.parseUrl(nextLocation.search);
    if (!trackingOnly) {
      if (action === 'POP' && this.historyLength > 0) {
        this.historyLength -= 1;
      }
      if (action === 'PUSH') {
        this.historyLength += 1;
      }
    }
    const prevHistory = this.store.getState().history;
    const data = {
      trackingOnly,
      key: nextLocation.key || 'init',
      hash: nextLocation.hash,
      pathname: nextLocation.pathname,
      search: nextLocation.search,
      state: nextLocation.state,
      action: action,
      query: removeXSS(query),
      params: newRoute.match && newRoute.match.params,
      routePath: newRoute.config && newRoute.config.path,
      routeName: newRoute.config && newRoute.config.routeName,
      chunkName: newRoute.config && newRoute.config.chunkName,
      isNavigating:
        newRoute.config.version > 1
          ? false
          : this.props.disableNavigating !== true,
      lastHistory: prevHistory,
      historyLength: this.historyLength,
    };
    if (typeof this.props.beforeLocationChange === 'function') {
      const shouldContinue = this.props.beforeLocationChange({
        nextHistory: data,
        prevHistory: prevHistory,
      });
      if (!shouldContinue) return;
    }

    // render page target
    const changedPage =
      newRoute.config.component !== this.state.route.config.component;
    if (!trackingOnly) {
      const { modal: _1, ...query } = data.query;
      const { modal: _2, ...prevQuery } = prevHistory.query;

      if (data.pathname !== prevHistory.pathname || !_equal(query, prevQuery)) {
        this.store.dispatch({ type: '@action/CHANGE_SESSION' });
      }
    }

    this.store.dispatch(
      actions.updateStore(
        {
          data,
          status: DATA_STATUS.SUCCESS,
          meta: {},
        },
        '_',
        'History',
        '_',
        changedPage
          ? {
              observedBits: 0,
            }
          : {},
      ),
    );
    if (changedPage) {
      this.setState(
        {
          route: newRoute,
        },
        () => {
          this.updateOldStore(nextLocation, data, trackingOnly);
          setTimeout(() => {
            window.scrollTo(0, window.scrollY + 1);
            window.scrollTo(0, window.scrollY - 1);
          }, 1000);
        },
      );
    } else {
      this.updateOldStore(nextLocation, data, trackingOnly);
    }
  };

  updateOldStore = (location, data, trackingOnly) => {
    requestAnimationFrame(() => {
      if (!trackingOnly) {
        if (
          data.action !== 'POP' &&
          (!location.state || location.state.scrollTop !== false)
        ) {
          window.scrollTo(0, 0);
        }
        this.store.dispatch(
          actions.updateStore(
            {
              data,
              status: DATA_STATUS.SUCCESS,
              meta: {},
            },
            '_',
            'GlobalHistory',
            '_',
          ),
        );
      }
      this.store.dispatch({
        type: LOCATION_CHANGE,
        payload: data,
      });
    });
  };

  getRouterContext = () => {
    return {
      history: this.props.history,
      location: this.state.location,
      match: this.state.route.match,
      staticContext: this.props.staticContext,
    };
  };

  render() {
    const RouteComponent =
      this.state.route &&
      this.state.route.config &&
      this.state.route.config.component;

    return (
      <RouterContext.Provider value={this.getRouterContext()}>
        <RouteComponent />
      </RouterContext.Provider>
    );
  }
}
