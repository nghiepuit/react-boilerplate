if (process.env.BUILD_TOOL_ENABLE_JS_SOURCE_MAP) {
  require('source-map-support').install();
}

global.console.info('Setup polyfill!');

import 'core-js/web/dom-collections';
import 'regenerator-runtime/runtime';

import { polyfill } from './polyfill/server.polyfill';

global.console.info('Setup app!');
polyfill().then(() => import('./server/index'));

process.on('uncaughtException', err => {
  global.console.log('whoops! There was an uncaught error', err);
});

process.on('unhandledRejection', (reason, promise) => {
  global.console.log('Unhandled rejection', {
    reason: reason,
    promise: promise,
  });
});
