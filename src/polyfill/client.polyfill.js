import checkSupportedBrowser from './../helpers/checkSupportedBrowser';

export async function polyfill() {
  if (!window.fetch) {
    await import('whatwg-fetch');
  }
  if (!window.requestAnimationFrame) {
    await import('./requestAnimationFrame');
  }

  const supportedBrowser = {
    Chrome: 70,
    Safari: 12,
  };
  if (!checkSupportedBrowser(supportedBrowser)) {
    await import(/* webpackChunkName: "polyfill" */ './legacyClient.polyfill');
  }
}
