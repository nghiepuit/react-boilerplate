import cookieParser from 'cookie-parser';
import path from 'path';
import Loadable from 'react-loadable';
import Server from './../setup/Server';
import { CookieStorage } from '../storages/cookie';
import { preloadComponent } from './../components/Loadable';
import PageMetaData from './../components/PageMetaData';
import Root from './../components/Root';
import reducers from './../redux/reducers';
import routes from './../routes';
import renderInternalServerError from './renderInternalServerError';

(async () => {
  const PORT = process.env.PORT;

  await Loadable.preloadAll();
  await preloadComponent();

  let modules = [];

  const instance = new Server({
    content: path.resolve('./build/frontend'),
    proxy: process.env.APP_ENABLE_API_PROXY && require('./apiProxy')(),
    staticRes: process.env.APP_BASE_DOMAIN + '/m/wap_v2/home/web-base-url',
    routes: routes,
    redux: {
      reducers,
    },
    layout: Root,
    metaRender: PageMetaData,
    publicUrl: process.env.PUBLIC_URL || '',
    storages: [['cookie', CookieStorage]],
    modules,
    before: (app) => {
      app.disable('x-powered-by');
      app.use(cookieParser());
      // TODO: redirect if change request affect your base url
    },
    after: (app) => {
      app.use(renderInternalServerError);
    },
  });

  try {
    await instance.listen(process.env.PORT);
    global.console.log('Server running at PORT:' + process.env.PORT);
  } catch (error) {
    if (error.syscall !== 'listen') {
      throw error;
    }
    var bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        global.console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        global.console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        global.console.log(error);
        process.exit(1);
    }
  }
})();
