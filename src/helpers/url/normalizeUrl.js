import getBaseUrl from './getBaseUrl';
import addEndSlash from './addEndSlash';

/**
 * TODO: config sentry here
 */
export default (url, absolute = false, endSlash = true) => {
  if (typeof url !== 'string') {
    // getSentry().then(sentry => {
    //   sentry.withScope(scope => {
    //     scope.setExtra('url', url);
    //     sentry.captureException(
    //       new Error('Call normalize url without prodive url'),
    //     );
    //   });
    // });
    return '';
  }
  if (url.length === 0) {
    return '';
  }
  const hasProtocol = /^https?:\/\//.test(url);
  var relativeUrl = (url[0] !== '/' ? '/' : '') + url;
  var result = relativeUrl;
  if (absolute) {
    if (hasProtocol) {
      result = url;
    } else {
      result = getBaseUrl() + relativeUrl;
    }
  } else if (hasProtocol) {
    result = url.replace(/^https?:\/\/[^/]+\//, '/');
  }
  return endSlash ? addEndSlash(result) : result;
};
