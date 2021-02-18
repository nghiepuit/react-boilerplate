import createMemoryHistory from 'history/createMemoryHistory';
import checkIsRobot from 'isbot';
import _get from 'lodash-es/get';
import _transform from 'lodash-es/transform';
import qs from 'query-string';
import React from 'react';
import { renderToNodeStream, renderToString } from 'react-dom/server';
import { Helmet } from 'react-helmet';
import { Provider as StoreProvider } from 'react-redux';
import { compose } from 'recompose';
import serializeJavascript from 'serialize-javascript';
import { checkRequestIsInApp } from '../../helpers/checkRequestIsInApp';
import normalizeUrl from '../../helpers/url/normalizeUrl';
import AppContext from './../../context/AppContext';
import { withGlobalDataProvider } from './../../hocs/withGlobalData';
import {
  actions,
  DataProvider,
  DATA_STATUS,
  handleFetchRequest
} from './../../redux';
import configureStore from './../../redux/configureStore';
import { matchRoute } from './../../setup/ssr/utils';
import { ensurePrefix } from './ensurePrefix';
import getBaseUrl from './getBaseUrl';
import HtmlStreamBuilder from './HtmlStreamBuilder';
import HtmlStringBuilder from './HtmlStringBuilder';
import { renderResultCache } from './renderResultCache';

const APP_RENDER_TIMEOUT = Number.parseInt(
  process.env.APP_RENDER_TIMEOUT || 1000,
);
let APP_RENDER_RATE_LIMIT = Number.parseInt(
  process.env.APP_RENDER_RATE_LIMIT || 120,
);
const APP_ENABLE_NODE_CACHE = process.env.APP_ENABLE_NODE_CACHE || false;

let appShell = null;
let currentConcurrentyRequest = 0;

function configHistory(url) {
  const historyConfig = {
    initialEntries: [url],
    initialIndex: 0,
    getUserConfirmation: null,
  };

  try {
    return createMemoryHistory(historyConfig);
  } catch (error) {
    try {
      return createMemoryHistory({
        ...historyConfig,
        initialEntries: [encodeURI(url)],
      });
    } catch (error) {
      throw new Error("Can't create history");
    }
  }
}

async function readFromStream(stream) {
  return new Promise((resolve, reject) => {
    let timeout = setTimeout(
      () => reject(new Error('Render timeout')),
      APP_RENDER_TIMEOUT,
    );
    const bufferArray = [];
    stream.on('error', (error) => {
      reject(error);
    });
    stream.on('data', (data) => {
      bufferArray.push(data);
    });
    stream.on('end', () => {
      clearTimeout(timeout);
      resolve(Buffer.concat(bufferArray));
    });
  });
}

function checkHttpStatusCode(routeName) {
  if (routeName === '@@Route/NotFound') {
    return 404;
  }
  return 200;
}

function escapeSpecialChars(str) {
  return str
    .replace(/\\n/g, '\\\\n')
    .replace(/\\r/g, '\\\\r')
    .replace(/\\t/g, '\\\\t')
    .replace(/\\\\s/g, '\\\\\\\\s')
    .replace(/\\\\S/g, '\\\\\\\\S')
    .replace(/\\f/g, '\\\\f');
}

function prepareHistory(history, store, routeName, matched) {
  const location = history.location;
  const action = history.action;

  const query = _transform(
    qs.parseUrl(location.search).query,
    (result, value, key) => {
      let newValue = value;
      if (key !== 'q' && typeof value === 'string' && value.indexOf(',') > -1) {
        newValue = value.split(',');
      }
      result[key] = newValue;
    },
  );

  const historyState = {
    key: location.key,
    pathname: location.pathname,
    hash: location.hash,
    state: location.state,
    action,
    query: query,
    search: location.search,
    params: matched.params,
    routePath: matched.path,
    routeName: routeName,
    historyLength: 0,
  };

  store.dispatch(
    actions.updateStore(
      {
        data: historyState,
        status: DATA_STATUS.SUCCESS,
        meta: {},
      },
      '_',
      'GlobalHistory',
      '_',
    ),
  );
  store.dispatch(
    actions.updateStore(
      {
        data: historyState,
        status: DATA_STATUS.SUCCESS,
        meta: {},
      },
      '_',
      'History',
      '_',
    ),
  );
  return historyState;
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

export default class ReactRender {
  constructor({ req, res, next, config, routes, assets }) {
    this.__startTime = Date.now();
    this.__req = req;
    this.__res = res;
    this.__next = next;
    this.__config = config;
    this.__routes = routes;
    this.__assets = assets;
    this.__delay = 0;
    this.__renderResult = {
      code: 200,
      isRedirected: false,
      isCached: false,
      isSetCookie: false,
      redirectUrl: null,
      renderCount: 0,
      chunkName: null,
      fetchs: [],
    };
  }

  async render(startTime) {
    this.__delay = Date.now() - startTime;
    if (currentConcurrentyRequest > APP_RENDER_RATE_LIMIT) {
      await this.renderAppShell();
      return;
    }
    currentConcurrentyRequest += 1;

    let dataSent = false;

    console.log('-------');
    console.log(this.__req.url);
    console.log('[ssr] prepareRenderResult');
    await this.prepareRenderResult();
    const isCached = this.__renderResult.isCached;

    try {
      console.log('[ssr] prepareHTMLBuilder');
      await this.prepareHTMLBuilder();

      if (isCached) {
        console.log('[ssr] sendHTTPHeader');
        dataSent = true;
        await this.sendHTTPHeader();
      }

      console.log('[ssr] prepareApplication');
      await this.prepareApplication();
      console.log('[ssr] prepareRoute');
      await this.prepareRoute();
      console.log('[ssr] prepareStaticData');
      await this.prepareStaticData();

      console.log('[ssr] sendHeaderHTML');
      await this.sendHeaderHTML();
      console.log('[ssr] sendBodyHTML');
      await this.sendBodyHTML();
      console.log('[ssr] sendFooterHTML');
      await this.sendFooterHTML();

      if (this.__renderResult.isRedirected) {
        this.__res.redirect(
          this.__renderResult.code,
          normalizeUrl(this.__renderResult.redirectUrl, true),
        );
        currentConcurrentyRequest -= 1;
        return;
      }

      if (!isCached) {
        console.log('[ssr] sendHTTPHeader');
        dataSent = true;
        await this.sendHTTPHeader();
        this.__res.write(this.__builder.result);
      }

      console.log('[ssr] end');
      this.__res.end();
      currentConcurrentyRequest -= 1;
    } catch (error) {
      currentConcurrentyRequest -= 1;
      await this.renderInternalServerErrorPage(error, {
        dataSent,
        isCached,
      });
    }
  }

  async renderAppShell() {
    if (!appShell) {
      console.log('[ssr] renderAppShell');
      this.prepareHTMLBuilder();

      console.log('[ssr] sendHeaderHTML');
      await this.sendHeaderHTML();

      console.log('[ssr] sendBodyHTML');
      await this.__builder.writeTemplate();
      await this.__builder.writeString('<div></div>');
      await this.__builder.writeTemplate();

      console.log('[ssr] sendFooterHTML');
      await this.sendFooterHTML();

      appShell = this.__builder.result;
    }
    this.__res.writeHead(206, {
      'Content-Type': 'text/html; charset=utf-8',
    });
    this.__res.write(appShell);
    this.__res.end();
  }

  async renderInternalServerErrorPage(ex, { dataSent, isCached }) {
    console.log('[ssr] renderInternalServerErrorPage');
    this.prepareHTMLBuilder();

    if (!dataSent) {
      console.log('[ssr] prepareHTMLBuilder');
      this.__renderResult.code = 500;
      await this.sendHTTPHeader();
    }

    console.log('[ssr] sendHeaderHTML');
    await this.sendHeaderHTML();

    console.log('[ssr] sendBodyHTML');
    await this.__builder.writeTemplate();
    await this.__builder.writeScript(
      `window.__SSR_ERROR__ = ${serializeJavascript(
        {
          message: ex.message,
          stack: ex.stack,
          path: this.__req.path,
        },
        {
          isJSON: true,
        },
      )};`,
    );
    await this.__builder.writeTemplate();

    console.log('[ssr] sendFooterHTML');
    await this.sendFooterHTML();

    if (!isCached) {
      this.__res.write(this.__builder.result);
    }
    this.__res.end();
  }

  async prepareStaticData() {
    this.__baseUrl = await getBaseUrl(this.__config.staticRes);
  }

  prepareRenderResult() {
    if (!APP_ENABLE_NODE_CACHE) {
      return;
    }
    this.__isRobot = checkIsRobot(this.__req.headers['user-agent']);
    const cachedRenderResult = this.__isRobot
      ? renderResultCache.peek(this.__req.url)
      : renderResultCache.get(this.__req.url);

    if (cachedRenderResult) {
      this.__renderResult = cachedRenderResult;
    }
  }

  prepareHTMLBuilder() {
    const isCached = this.__renderResult.isCached;
    if (isCached) {
      this.__builder = new HtmlStreamBuilder(this.__res);
    } else {
      this.__builder = new HtmlStringBuilder();
    }
  }

  prepareApplication() {
    this.__isInApp = checkRequestIsInApp(this.__req) ? true : false;
    this.__history = configHistory(this.__req.url);
    this.__store = configureStore({
      history: this.__history,
      customMiddlewares: this.__config.redux.middlewares,
      reducers: this.__config.redux.reducers,
    });
  }

  async prepareRoute() {
    this.__routeInfo = matchRoute(this.__req.path, this.__routes);
    const route = this.__routeInfo.route;
    this.__renderResult.chunkName = route.chunkName;
    this.__renderResult.code = checkHttpStatusCode(route.routeName);
    const historyState = prepareHistory(
      this.__history,
      this.__store,
      route.routeName,
      this.__routeInfo.matched,
    );
    if (route.onRender instanceof Function) {
      route.onRender(this.__store.dispatch, historyState);
    }
    const component = route.component;
    if (component.then instanceof Function) {
      await component;
    }
  }

  async sendHTTPHeader() {
    this.__res.writeHead(this.__renderResult.code, {
      'Content-Type': 'text/html; charset=utf-8',
    });
  }

  async sendHeaderHTML() {
    const builder = this.__builder;
    const assets = this.__assets;

    await builder.writeTemplate();
    builder.writeCommentLine(`[start] ${this.__startTime}`);
    builder.writeCommentLine(`[ccr] ${currentConcurrentyRequest}`);
    await builder.writeTemplate();

    // builder.writePrefetchAsset(assets.mainJS);
    // builder.writePrefetchAsset(assets.appJS);
    await builder.writeTemplate();
    await builder.writeStyle(
      assets.fontFace,
      'static/assets/css/font-face.css',
    );
    await this.__builder.writeStyleTags(assets.vendorsCSS);
    await this.__builder.writeStyleTags(assets.appCSS);
    const chunkAssets = assets.getAssetsByChunkName(
      this.__renderResult.chunkName,
    );
    await this.__builder.writeStyleTags(
      chunkAssets.css.map(
        (asset) => this.__config.publicUrl + ensurePrefix(asset.file, '/'),
      ),
    );
    await builder.writeScriptTags(assets.mainJS);
    await builder.writeScriptTags(assets.appJS);

    await builder.writeTemplate();
  }

  async sendBodyHTML() {
    const builder = this.__builder;
    const RootComponent = compose(
      withGlobalDataProvider({
        globalData: { baseUrl: this.__baseUrl },
        window: {},
      }),
    )(this.__config.layout);
    const appContext = {
      isInApp: this.__isInApp,
    };
    const store = this.__store;
    let promiseCollecter = [];
    let fetchParamsCollector = [];
    let shouldRender = false;
    let bodyHTML = Buffer.from('');
    const tree = (
      <AppContext.Provider value={appContext}>
        <DataProvider
          store={store}
          settings={this.__config.settings}
          ignoreEffect
          promiseCollecter={promiseCollecter}
          fetchParamsCollector={fetchParamsCollector}
          renderResult={this.__renderResult}
          storages={this.__config.storages}
          req={this.__req}
          res={this.__res}
        >
          <StoreProvider store={store}>
            <RootComponent routes={this.__routes} history={this.__history} />
          </StoreProvider>
        </DataProvider>
      </AppContext.Provider>
    );

    if (this.__renderResult.isCached) {
      const storages = (this.__config.storages || []).reduce(
        (result, storage) => {
          const Constructor = storage[1];
          result[storage[0]] = new Constructor(this.__req, this.__res);
          return result;
        },
        {},
      );

      currentConcurrentyRequest += 1;
      const storeUpdates = await Promise.all(
        this.__renderResult.fetchs.map(async (fetchReq) => {
          try {
            const result = await handleFetchRequest({
              service: fetchReq.service,
              params: fetchReq.params,
              onResponse: fetchReq.onResponse,
              getter: fetchReq.getter,
              type: fetchReq.type,
              alias: fetchReq.alias,
              sessionKey: _get(store.getState(), ['tracking', 'sessionKey'], 0),
              cookie: storages['cookie'],
              context: {
                dispatch: store.dispatch,
                getStorage: (name) => {
                  return storages[name];
                },
              },
            });
            return result;
          } catch (ex) {
            // errors.push(ex.message); // which errors??????
          }
        }),
      ).finally(() => {
        currentConcurrentyRequest -= 1;
      });
      storeUpdates.filter(Boolean).map((update) => store.dispatch(update));
      await this.sendMetaData();
      await new Promise((resolve, reject) => {
        const stream = renderToNodeStream(tree);
        stream.on('error', (error) => {
          resolve();
        });
        stream.on('end', () => {
          resolve();
        });
        stream.pipe(this.__res, {
          end: false,
        });
      });
      builder.writeTemplate();
    } else {
      // bodyHTML = renderToString(tree);

      // render 1st to collect api promise
      bodyHTML = await readFromStream(renderToNodeStream(tree));
      shouldRender = promiseCollecter.length > 0;

      // loop until all api resolve
      while (shouldRender) {
        currentConcurrentyRequest += 1;
        await Promise.all(promiseCollecter).finally(() => {
          currentConcurrentyRequest -= 1;
        });
        promiseCollecter.splice(0, promiseCollecter.length);

        this.__renderResult.renderCount++;
        bodyHTML = await readFromStream(renderToNodeStream(tree));
        shouldRender = promiseCollecter.length > 0;
        if (this.__renderResult.redirectUrl) {
          shouldRender = false;
        }
      }
      await this.sendMetaData();
      await builder.writeString(bodyHTML);
      await builder.writeTemplate();

      if (APP_ENABLE_NODE_CACHE) {
        if (
          this.__renderResult.code === 200 &&
          !this.__isBotReq &&
          !this.__renderResult.isSetCookie
        ) {
          this.__renderResult.isCached = true;
          renderResultCache.set(this.__req.url, this.__renderResult);
        }
      }
    }
  }

  async sendMetaData() {
    const builder = this.__builder;
    const store = this.__store;
    renderToString(
      <DataProvider
        store={store}
        settings={this.__config.settings}
        storages={this.__config.storages}
        req={this.__req}
        res={this.__res}
      >
        <StoreProvider store={store}>
          <this.__config.metaRender />
        </StoreProvider>
      </DataProvider>,
    );
    const helmet = Helmet.renderStatic();
    const metaData = [
      helmet.title.toString(),
      helmet.meta.toString(),
      helmet.link.toString(),
      helmet.script.toString(),
    ].join('');
    await builder.writeString(metaData);
    await builder.writeTemplate();
  }

  async sendFooterHTML() {
    await this.__builder.writeScript(
      `window.__GLOBAL_DATA__=JSON.parse(\`${serializeJavascript(
        { baseUrl: this.__baseUrl },
        {
          isJSON: true,
        },
      )}\`); window.__IN_APP__ = ${JSON.stringify(
        this.__isInApp || false,
      )}; window.__FIRST_LOAD__= true;`,
    );
    if (!this.__config.shouldNotInitialState && this.__store) {
      await this.__builder.writeScript(
        `window.__INITIAL_STATE__=${serializeJavascript(
          this.__store.getState(),
          {
            isJSON: true,
          },
        )};`,
      );
    }

    await this.__builder.writeTemplate();
    // await this.__builder.writeScriptTags(this.__assets.mainJS);
    await this.__builder.writeTemplate();
    await this.__builder.writeCommentLine(`[version] ${__MAJOR_VERSION__}`);
    await this.__builder.writeCommentLine(`[build] ${__COMMIT_HASH__}`);
    await this.__builder.writeCommentLine(`[build-time] ${__BUILD_TIME__}`);
    await this.__builder.writeCommentLine(`[end] ${Date.now()}`);
    await this.__builder.writeTemplate();
  }
}
