export default function checkSupportedBrowser(supportedBrowser) {
  var ua = navigator.userAgent,
    tem,
    M =
      ua.match(
        /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i,
      ) || [];

  let browser = {};
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    browser = { name: 'IE', version: tem[1] || '' };
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/(\d+)/i)) != null) {
    M.splice(1, 1, tem[1]);
  }

  browser = {
    name: M[0],
    version: M[1],
  };

  return (
    supportedBrowser[browser.name] &&
    browser.version >= supportedBrowser[browser.name]
  );
}
