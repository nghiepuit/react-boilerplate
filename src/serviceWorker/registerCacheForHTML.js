import {
  getCacheName,
  cacheHandleFactory,
  checkIsMobileRequest,
  flushHandleFactory,
  checkIsChangedPlatform,
} from './helpers';

const blackList = [new RegExp(process.env.APP_BASE_DOMAIN + '/$')];

export default onRoute => {
  const version = self.__version;
  const cacheType = 'html';

  const cacheNames = {
    wap: getCacheName(cacheType, 'wap'),
    web: getCacheName(cacheType, 'web'),
  };
  const cacheHandlers = {
    [cacheNames.wap]: cacheHandleFactory(cacheNames.wap),
    [cacheNames.web]: cacheHandleFactory(cacheNames.web),
  };

  const handler = args => {
    const isChangedPlatform = checkIsChangedPlatform(args);
    const isValidOnRoute = typeof onRoute === 'function';
    const shouldCallOnRoutes = isValidOnRoute && !isChangedPlatform;
    if (shouldCallOnRoutes) {
      onRoute();
    }

    const isMobileRequest = checkIsMobileRequest(args);
    const handlerName = isMobileRequest ? cacheNames.wap : cacheNames.web;
    const cacheHandler = cacheHandlers[handlerName];

    args.event.respondWith(
      (async () => {
        try {
          const cachedResponse = await cacheHandler.handle(args);
          if (cachedResponse) {
            return cachedResponse;
          }
          // const preloadResponse = await event.preloadResponse;
          // if (preloadResponse) {
          //   console.log('[SW] preload response');
          //   return preloadResponse;
          // }
        } catch (ex) {
          self.console.log('[SW] Ex:' + ex.message);
        }
        self.console.log('[SW] default response');
        return await fetch(
          `${process.env.PUBLIC_URL ||
            process.env.APP_BASE_DOMAIN}/static/pwa.${version}.html`,
        );
      })(),
    );
  };

  const matcher = ({ event }) => {
    const { request } = event;
    if (!request || request.mode !== 'navigate') {
      return false;
    }
    const pathnameAndSearch = request.url;

    for (const regExp of blackList) {
      if (regExp.test(pathnameAndSearch)) {
        return false;
      }
    }

    return true;
  };

  workbox.routing.registerRoute(matcher, handler);

  console.log('Ready to caching for HTML!', cacheHandlers);

  return flushHandleFactory(cacheHandlers);
};
