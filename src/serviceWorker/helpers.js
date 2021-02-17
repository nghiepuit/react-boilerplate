import _memoize from 'lodash/memoize';

const MOBILE_UA_REGEXP = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i;

export const checkIsMobileDevice = _memoize(userAgent =>
  MOBILE_UA_REGEXP.test(userAgent),
);

export const checkIsMobileRequest = args =>
  checkIsMobileDevice(args.request.headers.get('user-agent') || '');

export const getCacheName = (type, platform) =>
  `[${(type || '').toUpperCase()}:${platform}]`;

const CACHE_STATUSES_CONFIG = {
  statuses: [200],
};

const CACHE_EXPIRATION_CONFIG = {
  maxEntries: 100,
  maxAgeSeconds: 172800,
  purgeOnQuotaError: true,
};

const clientRedirect = async ({ request, event }) => {
  const requestFollowing = new Request(request, {
    redirect: 'follow',
  });
  const responseFollowing = await fetch(requestFollowing);
  const location = responseFollowing.url;
  if (!location) {
    return false;
  }

  self.clients.matchAll({ type: 'window' }).then(clients => {
    clients.forEach(client => {
      const clientIsMatched =
        client.id === event.resultingClientId || client.id === event.clientId;
      const isAllowNavigate = 'navigate' in client;
      const allowRedirect = clientIsMatched && isAllowNavigate;
      if (allowRedirect) {
        client.navigate(location);
      }
    });
  });

  return true;
};

const checkIsRedirect = ({ response }) =>
  response.type === 'opaqueredirect' ||
  (response.status >= 300 && response.status <= 308);

const deleteCacheEntry = async (cacheName, requestUrl) => {
  const cache = await caches.open(cacheName);
  await cache.delete(requestUrl);
  return true;
};

export const cacheHandleFactory = (cacheName, config) => {
  const { expirationConfig, statusesConfig } = config || {};

  const cacheExpirePlugin = new workbox.expiration.Plugin({
    ...CACHE_EXPIRATION_CONFIG,
    ...(expirationConfig || {}),
  });

  const statusesCachePlugin = new workbox.cacheableResponse.Plugin({
    ...CACHE_STATUSES_CONFIG,
    ...(statusesConfig || {}),
  });

  statusesCachePlugin.originalCacheWillUpdate =
    statusesCachePlugin.cacheWillUpdate;
  statusesCachePlugin.cacheWillUpdate = async args => {
    const result = statusesCachePlugin.originalCacheWillUpdate(args);
    const shouldRedirect = checkIsRedirect(args);
    if (shouldRedirect) {
      const deleteCache = deleteCacheEntry(cacheName, args.request.url);
      const redirect = clientRedirect(args);
      await Promise.all([deleteCache, redirect]);
      return null;
    }

    return result;
  };

  const cacheHandler = new workbox.strategies.StaleWhileRevalidate({
    cacheName,
    plugins: [cacheExpirePlugin, statusesCachePlugin],
  });

  cacheHandler.plugins = {
    cacheExpirePlugin,
    statusesCachePlugin,
  };

  cacheHandler.flush = async () => {
    await cacheExpirePlugin.deleteCacheAndMetadata();
    return true;
  };

  return cacheHandler;
};

export const flushHandleFactory = cacheHandlers => async () => {
  const keysOf = Object.keys(cacheHandlers);
  for (const key in keysOf) {
    const cacheHandler = cacheHandlers[key];
    if (!cacheHandler || typeof cacheHandler.flush !== 'function') {
      continue;
    }
    await cacheHandler.flush();
  }

  return true;
};

export const checkIsChangedPlatform = args => {
  const currentPlatform = process.env.PLATFORM;
  const requestPlatform = checkIsMobileRequest(args) ? 'wap' : 'web';

  const isChanged = currentPlatform !== requestPlatform;
  return isChanged;
};
