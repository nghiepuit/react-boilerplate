export function prepareClient(client) {
  const layout = require('./../components/Root').default;
  const metaRender = require('./../components/PageMetaData').default;

  const routes = require('./../routes').default;
  const redux = {
    reducers: require('./../redux/reducers').default,
    middlewares: [
      // require('./../tracking/middleware').default,
      require('./../redux/middlewares/mergeActions').default,
      require('./../redux/middlewares/cookies').default,
    ],
  };
  const storages = [['cookie', require('./../storages/cookie').CookieStorage]];

  client.config = {
    layout,
    metaRender,
    routes,
    redux,
    storages,
  };
}
