import {
  getCacheName,
  cacheHandleFactory,
  checkIsMobileRequest,
  flushHandleFactory,
} from './helpers';

export default () => {
  const cacheType = 'api';

  const cacheNames = {
    wap: getCacheName(cacheType, 'wap'),
    web: getCacheName(cacheType, 'web'),
  };
  const cacheHandlers = {
    [cacheNames.wap]: cacheHandleFactory(cacheNames.wap),
    [cacheNames.web]: cacheHandleFactory(cacheNames.web),
  };

  const onFetchReponse = response =>
    !response ? { status: { code: 404 } } : response;
  const handler = args => {
    const isMobileRequest = checkIsMobileRequest(args);
    const handlerName = isMobileRequest ? cacheNames.wap : cacheNames.web;
    const cacheHandler = cacheHandlers[handlerName];
    console.log('API - User agent is mobile?', isMobileRequest);

    const result = cacheHandler.handle(args).then(onFetchReponse);
    return result;
  };

  const matcher = ({ event }) =>
    event.request.url.search(/mall\/shop|home\/recommend-category/g) > -1;

  workbox.routing.registerRoute(matcher, handler);

  console.log('Ready to caching for APIs!', cacheHandlers);

  return flushHandleFactory(cacheHandlers);
};
