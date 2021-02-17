import 'core-js';

export async function polyfill() {
  if (!global.fetch) {
    const nodeFetch = require('node-fetch');

    const fetch = function(url, options) {
      if (/^\/\//.test(url)) {
        url = 'https:' + url;
      }
      return nodeFetch.call(this, url, options);
    };
    global.fetch = fetch;
    global.Response = nodeFetch.Response;
    global.Headers = nodeFetch.Headers;
    global.Request = nodeFetch.Request;
  }
}
