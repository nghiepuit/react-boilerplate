import 'lazysizes';
import preloadRoute from './helpers/preloadRoute';
import Client from './setup/Client';
import { prepareClient } from './setup/prepareClient';
import { prepareClientData } from './setup/prepareClientData';
import { prepareGlobalVariable } from './setup/prepareGlobalVariable';

const scrollToTop = () => {
  setTimeout(() => {
    if (window.scrollY > 0) {
      window.scrollTo(0, 0);
    }
  }, 100);
};

async function start() {
  if (!window.__GLOBAL_DATA__) {
    await (
      await import('./setup/loadGlobalData')
    ).default();
  }

  scrollToTop();

  const client = new Client();
  await client.setup((client) => {
    prepareClient(client);
    // TODO: prepare tracking here
  });

  await client.beforeRender(async (client) => {
    prepareGlobalVariable(client);
    require('./helpers/emitter').default.init({
      store: client.store,
      window,
    });
    prepareClientData(client.store);
    await preloadRoute(
      client.config.routes,
      window.location.pathname,
      client.store,
    );
  });

  await client.afterRender((client) => {
    // TODO: setup sentry and sw here
  });

  await client.init();
  await client.render();
}

if (document.readyState === 'complete') {
  start();
} else {
  window.addEventListener('load', () => {
    start();
  });
}
