import 'core-js/modules/es.promise';
import 'core-js/modules/es.object.to-string';
import 'core-js/modules/es.array.iterator';
import 'core-js/modules/es.promise.finally';
import 'core-js/modules/es.object.entries';
import 'core-js/modules/web.timers';
import 'core-js/modules/web.immediate';

import 'regenerator-runtime/runtime';

import { polyfill } from './polyfill/client.polyfill';
polyfill().then(() => import(/* webpackChunkName: "app" */ './app'));
