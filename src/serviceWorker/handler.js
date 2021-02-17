import cleanupOutdatedRoutingCaches from './cleanupOutdatedRoutingCaches';
import logError from './logError';
import registerCacheForAPIs from './registerCacheForAPIs';
import registerCacheForHTML from './registerCacheForHTML';
import registerPrecacheForApp from './registerPrecacheForApp';
import versionChecker, { checkUpdateOnFetch } from './versionChecker';

export default (
  version = self.__version, // define by build tools
  precacheManifest = self.__precacheManifest, // define by workbox plugin
) => {
  logError();

  workbox.setConfig({
    debug: false,
  });

  registerPrecacheForApp(precacheManifest || []);

  const htmlCacheFlush = registerCacheForHTML(checkUpdateOnFetch);
  const apiCacheFlush = registerCacheForAPIs();

  self.addEventListener('install', (event) => {
    self.console.log('[SW] install');
    event.waitUntil(self.skipWaiting());
  });

  self.addEventListener('activate', (event) => {
    self.console.log('[SW] activate');
    event.waitUntil(clients.claim());
    if (self.registration.navigationPreload) {
      event.waitUntil(async () => {
        const state = await self.registration.navigationPreload.getState();
        if (state) {
          await self.registration.navigationPreload.disable();
        }
      });
    }
  });

  const oldCacheFlush = () => Promise.all([htmlCacheFlush(), apiCacheFlush()]);
  versionChecker(oldCacheFlush);

  cleanupOutdatedRoutingCaches();

  self.console.log(`[ServiceWorker] using version ${version}`);
};
