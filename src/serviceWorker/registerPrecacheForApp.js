import { getCacheName } from './helpers';

export default precacheManifest => {
  const platform = process.env.PLATFORM;
  const cacheType = 'assets';
  const cacheName = getCacheName(cacheType, platform);

  workbox.core.setCacheNameDetails({
    prefix: cacheName,
    suffix: 'v1',
    precache: 'precache',
    runtime: 'runtime',
    googleAnalytics: 'ga',
  });

  workbox.precaching.precacheAndRoute(precacheManifest || []);
  workbox.precaching.cleanupOutdatedCaches();

  return true;
};
