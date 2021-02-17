import express from 'express';
import useAfterRouter from './ssr/useAfterRouter';
import useCacheDump from './ssr/useCacheDump';
import useLogger from './ssr/useLogger';
import useProxyMiddleware from './ssr/useProxyMiddleware';
import useReactSSR from './ssr/useReactSSR';
import useStaticServer from './ssr/useStaticServer';

const checkIsEnabled = (value) => [true, 'true'].includes(value);

export default class Server {
  app = null;
  constructor(config) {
    const app = express();
    if (config.before instanceof Function) {
      config.before(app);
    }

    const enableAccessLogs = checkIsEnabled(process.env.APP_ACCESS_LOGS);
    if (enableAccessLogs) {
      useLogger(app);
    }

    useProxyMiddleware(app, config.proxy);
    useStaticServer(app, config.content);
    useCacheDump(app);
    useAfterRouter(app, config);
    useReactSSR(app, config);
    if (config.after instanceof Function) {
      config.after(app);
    }
    this.app = app;
  }

  listen = (port) => {
    return new Promise((resolve, reject) => {
      this.app.listen(port, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  };
}
