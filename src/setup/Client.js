import _get from 'lodash-es/get';
import React, { Fragment } from 'react';
import { Provider } from 'react-redux';
import { compose } from 'recompose';
import AppContext from './../context/AppContext';
import getHistory from './../history/createApplicationHistory';
import { withGlobalDataProvider } from './../hocs/withGlobalData';
import configureStore from './../redux/configureStore';
import DataProvider from './../redux/DataProvider';

const checkIsInApp = () => {
  const regHeaderInApp = _get(window, '__IN_APP__', 0) | 0;
  return regHeaderInApp;
};

export default class Client {
  setup = (setup) => {
    this.__setup = setup;
    return this;
  };

  beforeRender = (beforeRender) => {
    this.__beforeRender = beforeRender;
    return this;
  };

  afterRender = (afterRender) => {
    this.__afterRender = afterRender;
    return this;
  };

  init = async () => {
    if (this.__setup instanceof Function) {
      await this.__setup(this);
    }

    this.history = getHistory();

    this.initialReduxState = window.__INITIAL_STATE__;

    this.store = configureStore({
      history: this.history,
      initialState: this.initialReduxState,
      customMiddlewares: _get(this, ['config', 'redux', 'middlewares'], []),
      reducers: _get(this, ['config', 'redux', 'reducers'], {}),
    });

    if (process.env.NODE_ENV !== 'production') {
      window.store = this.store;
    }

    if (this.__beforeRender instanceof Function) {
      await this.__beforeRender(this);
    }

    const modules = _get(this.config, 'modules') || [];
    await Promise.all(modules.map((m) => m.beforeRender(this)));
  };

  render = async () => {
    const store = this.store;
    const routes = [
      ...(_get(this.config, 'modules') || []).map((m) => m.getRoute(this)),
      ...(_get(this.config, 'routes') || []),
    ];
    const history = this.history;

    const Layout = compose(
      withGlobalDataProvider({
        globalData: window.__GLOBAL_DATA__ || {},
        window: window,
      }),
    )(this.config.layout);

    const appContext = {
      isInApp: checkIsInApp(),
    };

    const MetaComp = this.config.metaRender;
    const tree = (
      <AppContext.Provider value={appContext}>
        <DataProvider
          store={store}
          settings={this.config.setting}
          storages={this.config.storages}
        >
          <Provider store={store}>
            <Fragment>
              <Layout routes={routes} history={history} />
              {MetaComp && <MetaComp />}
            </Fragment>
          </Provider>
        </DataProvider>
      </AppContext.Provider>
    );

    if (process.env.NODE_ENV === 'production') {
      require('react-dom').hydrate(tree, document.getElementById('root'));
    } else {
      require('react-dom').render(tree, document.getElementById('root'));
    }

    if (this.__afterRender instanceof Function) {
      await this.__afterRender(this);
    }
    const modules = _get(this.config, 'modules') || [];
    await Promise.all(modules.map((m) => m.afterRender(this)));
  };
}
