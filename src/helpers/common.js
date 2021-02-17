import _get from 'lodash-es/get';
import _indexOf from 'lodash-es/indexOf';
import _memoize from 'lodash-es/memoize';
import UAParser from 'ua-parser-js';
import { v4 as uuid } from 'uuid';
import {
  BROWSER_CHROME,
  BROWSER_EDGE,
  BROWSER_FIREFOX,
  BROWSER_IE,
  BROWSER_SAFARI,
  MOBILE_OS_ANDROID,
  MOBILE_OS_IOS,
} from './../helpers/const';
import * as Cookies from './../helpers/cookie';

const IPHONEX_WIDTH = 1125;
const IPHONEX_HEIGHT = 2436;

export const memoize = (rawFunction, resolver) => {
  if (__SERVER__) {
    return rawFunction;
  }
  return _memoize(rawFunction, resolver);
};

export const getDeviceInfo = () => {
  if (!_get(window, 'deviceInfo')) {
    const parser = new UAParser();
    window.deviceInfo = parser.getResult();
  }
  return window.deviceInfo;
};

export const deviceInfo = () => {
  const device = getDeviceInfo();
  return {
    getBrowser() {
      return _get(device, 'browser.name');
    },
    isSafari() {
      return _get(device, 'browser.name') === 'Mobile Safari';
    },
    isSafariIos() {
      if (this.isSafari() && this.isIos()) return true;
      return false;
    },
    isChrome() {
      return _get(device, 'browser.name') === 'Chrome';
    },
    isIos() {
      return _get(device, 'os.name') === 'iOS';
    },
    isIphoneX() {
      if (!this.isIos()) return false;
      const ratio = window.devicePixelRatio || 1;
      const screen = {
        width: _get(window, 'screen.width', 1) * ratio,
        height: _get(window, 'screen.height', 1) * ratio,
      };
      if (screen.width === IPHONEX_WIDTH && screen.height === IPHONEX_HEIGHT) {
        return true;
      }
      return false;
    },
    isAndroid() {
      return _get(device, 'os.name') === 'Android';
    },
    isOtherDevice() {
      if (!this.isIos() && !this.isAndroid()) return true;
      return false;
    },
    isMobile() {
      return _get(device, 'device.type') === 'mobile';
    },
    isTablet() {
      return _get(device, 'device.type') === 'tablet';
    },
    isInApp() {
      return _get(window, 'navigator.standalone');
    },
  };
};

export const isInArray = (array, value) => {
  if (_indexOf(array, value) === -1) return false;
  return true;
};
export const isInApp = (window) => {
  return _get(window, '__IN_APP__', 0) | 0;
};
export const formatNumber = memoize((x, symbol = ',') => {
  if (!x) return '';
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, symbol);
});
export const formatNumberWithSymbol = (x, symbol) => {
  if (!x || !symbol) return '';
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, symbol);
};
export const formatPrice = (
  x,
  acceptZeroNumber = false,
  currencySymbol,
  numberSymbol,
) => {
  if (typeof x === 'function') {
    x = x.apply();
  }
  if (x === 0) {
    if (!acceptZeroNumber) return 'Miễn phí';
    return x;
  }
  if (!x) return '';
  if (!!currencySymbol)
    return formatNumberWithSymbol(x, numberSymbol) + currencySymbol;
  return formatNumber(x, numberSymbol || '.') + 'đ';
};

export const formatRangePrice = (
  min,
  max,
  acceptZeroNumber = false,
  currencySymbol,
  numberSymbol,
) => {
  if (min === max) {
    return formatPrice(
      min,
      (acceptZeroNumber = false),
      currencySymbol,
      numberSymbol,
    );
  }
  return (
    formatPrice(min, (acceptZeroNumber = false), currencySymbol, numberSymbol) +
    ' - ' +
    formatPrice(max, (acceptZeroNumber = false), currencySymbol, numberSymbol)
  );
};
export const friendlyNumber = (number, decPlaces = 0, isPrice = false) => {
  number = parseInt(number, 10) || 0;
  // 2 decimal places => 100, 3 => 1000, etc
  decPlaces = Math.pow(10, decPlaces);

  // Enumerate number abbreviations
  var abbrev = ['k', 'm', 'b', 't'];

  // Go through the array backwards, so we do the largest first
  for (var i = abbrev.length - 1; i >= 0; i--) {
    // Convert array index to "1000", "1000000", etc
    var size = Math.pow(10, (i + 1) * 3);

    // If the number is bigger or equal do the abbreviation
    if (size <= number) {
      // Here, we multiply by decPlaces, round, and then divide by decPlaces.
      // This gives us nice rounding to a particular decimal place.
      // In case, used to format price
      if (isPrice) {
        number = (number * decPlaces) / size / decPlaces;
      } else {
        number = Math.round((number * decPlaces) / size) / decPlaces;
      }
      // Handle special case where we round up to the next abbreviation
      if (number === 1000 && i < abbrev.length - 1) {
        number = 1;
        i++;
      }

      // Add the letter for the abbreviation
      number += abbrev[i];

      // We are done... stop
      break;
    }
  }
  return number;
};

export const removeEndsSlash = (str) => {
  if (str.endsWith('/')) {
    str = str.slice(0, -1);
  }
  return str;
};
export const roundDecimalNumber = (x) => {
  return Math.round(x * 100) / 100;
};
export const formatTimestamp = (time) => {
  if (!time) return '';
  time = new Date(time);
  var year = time.getFullYear();
  var month =
    time.getMonth() + 1 > 9 ? time.getMonth() + 1 : '0' + (time.getMonth() + 1);
  var date = time.getDate() > 9 ? time.getDate() : '0' + time.getDate();
  return `${date}/${month}/${year}`;
};
export const formatTimestampSocial = (time) => {
  if (!time) return '';
  var date = new Date(time || ''),
    seconds = (new Date().getTime() - date.getTime()) / 1000,
    numDays = Math.floor(seconds / 86400);

  if (isNaN(numDays) || numDays < 0 || numDays >= 31) return;
  if (numDays === 0) {
    if (seconds < 60) return 'vừa xem';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' phút trước';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' giờ trước';
  }
  if (numDays === 1) return 'hôm qua';
  if (numDays < 7) return numDays + ' ngày trước';
  return formatTimestamp(time);
};
export const isElementInViewport = (el) => {
  var rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) +
        el.clientHeight &&
    rect.right <=
      (window.innerWidth || document.documentElement.clientWidth) +
        el.clientWidth
  );
};

export const generateUUID = () => uuid();

export const lerp = (a, b, u) => {
  return (1 - u) * a + u * b;
};

export const calColor2Color = (start, end, pos, length) => {
  var step_u = 1.0 / length;
  var u = step_u * pos;
  var r = parseInt(lerp(start.r, end.r, u), 10);
  var g = parseInt(lerp(start.g, end.g, u), 10);
  var b = parseInt(lerp(start.b, end.b, u), 10);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
};

export const scrollToTop = () => {
  window.requestAnimationFrame(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 1);
  });
};

export const animateMoveFromTo = (ele, start, end, callback) => {
  var t1 = start.top,
    l1 = start.left,
    w1 = start.width;
  var t2 = end.top,
    l2 = end.left,
    w2 = end.width;
  var Y = 0;
  var step = Math.abs(t1 - t2) / 20;

  const delay = setInterval(function () {
    if (Y >= t1) {
      clearInterval(delay);
      ele.style.top = t2 + 'px';
      ele.style.left = l2 + 'px';
      ele.style.width = w2 + 'px';
      if (typeof callback === 'function') callback.apply(this);
    } else {
      let dl1 = (Y * l1) / t1;
      let dl2 = (Y * (w2 - l1 - w1)) / t1;
      ele.style.top = t1 - Y + 'px';
      ele.style.left = l1 - dl1 + 'px';
      ele.style.width = dl1 + w1 + dl2 + 'px';
      Y += step;
    }
  }, 10);
};

export const getMobileOperatingSystem = () => {
  let userAgent =
    window.navigator.userAgent || window.navigator.vendor || window.opera;

  if (/android/i.test(userAgent)) {
    return MOBILE_OS_ANDROID;
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return MOBILE_OS_IOS;
  }

  return 'unknown';
};

export const getBrowser = function () {
  let browser_name = '';
  if (__SERVER__) {
    return browser_name;
  }

  let isIE = false || !!window.document.documentMode;
  let isEdge = !isIE && !!window.StyleMedia;
  /**
   * CriOS: detect Chrome on iOS
   */
  if (
    (window.navigator.userAgent.indexOf('Chrome') !== -1 && !isEdge) ||
    window.navigator.userAgent.indexOf('CriOS') !== -1
  ) {
    browser_name = BROWSER_CHROME;
  } else if (window.navigator.userAgent.indexOf('Safari') !== -1 && !isEdge) {
    browser_name = BROWSER_SAFARI;
  } else if (window.navigator.userAgent.indexOf('Firefox') !== -1) {
    browser_name = BROWSER_FIREFOX;
  } else if (
    window.navigator.userAgent.indexOf('MSIE') !== -1 ||
    !!window.document.documentMode === true
  ) {
    //IF IE > 10
    browser_name = BROWSER_IE;
  } else if (isEdge) {
    browser_name = BROWSER_EDGE;
  } else {
    browser_name = 'other-browser';
  }
  return browser_name;
};

export const smoothScroll = {
  timer: null,
  stop: function () {
    clearTimeout(this.timer);
  },

  scrollTo: function (id, callback, options = {}) {
    var node = document.getElementById(id);
    if (!node) {
      console.warn('Not found ', id);
      return;
    }
    var settings = {
      duration: options.duration || 1000,
      easing: {
        outQuint: function (x, t, b, c, d) {
          return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
      },
    };
    var percentage;
    var startTime;
    var nodeTop = node.offsetTop + options.startOffset;
    var nodeHeight = node.offsetHeight;
    var body = document.body;
    var html = document.documentElement;
    var height = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight,
    );
    var windowHeight = window.innerHeight;
    var offset = window.pageYOffset;
    var delta = nodeTop - offset;
    var bottomScrollableY = height - windowHeight;
    var targetY =
      bottomScrollableY < delta
        ? bottomScrollableY - (height - nodeTop - nodeHeight + offset)
        : delta;

    startTime = Date.now();
    percentage = 0;

    if (this.timer) {
      clearInterval(this.timer);
    }

    function step() {
      var yScroll;
      var elapsed = Date.now() - startTime;

      if (elapsed > settings.duration) {
        clearTimeout(this.timer);
      }

      percentage = elapsed / settings.duration;

      if (percentage > 1) {
        clearTimeout(this.timer);

        if (callback) {
          callback();
        }
      } else {
        yScroll = settings.easing.outQuint(
          0,
          elapsed,
          offset,
          targetY,
          settings.duration,
        );
        window.scrollTo(0, yScroll);
        this.timer = setTimeout(step, 10);
      }
    }

    this.timer = setTimeout(step, 10);
  },
};

export const openPopupWindow = (url, title = '_blank', spec = {}) => {
  spec = {
    scrollbars: 'yes',
    width: 900,
    height: 500,
    ...spec,
  };
  var screen = window.screen;
  var dualScreenLeft =
    window.screenLeft !== undefined ? window.screenLeft : screen.left;
  var dualScreenTop =
    window.screenTop !== undefined ? window.screenTop : screen.top;

  var width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
    ? document.documentElement.clientWidth
    : screen.width;
  var height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
    ? document.documentElement.clientHeight
    : screen.height;
  spec.left = width / 2 - spec.width / 2 + dualScreenLeft;
  spec.top = height / 2 - spec.height / 2 + dualScreenTop;

  var specification = [];
  for (var key in spec) {
    specification.push(key + '=' + spec[key]);
  }
  var popup = window.open(url, title, specification.join(', '));

  // Puts focus on the popup
  if (window.focus) {
    popup.focus();
  }
  return popup;
};

/*
Format display: hh:mm | DD/MM/YYYY
Input: 1477297243
Outout: 15:20 | 24/10/2016
*/
export const formatTimeDisplay = (epochTime) => {
  if (!epochTime) return '';
  let today = new Date(0); // The 0 there is the key, which sets the date to the epoch
  today.setUTCSeconds(epochTime);
  let hh = today.getHours();
  let mm = today.getMinutes();
  let DD = today.getDate();
  let MM = today.getMonth() + 1;
  let YYYY = today.getFullYear();
  if (hh < 10) {
    hh = '0' + hh;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }
  if (DD < 10) {
    DD = '0' + DD;
  }
  if (MM < 10) {
    MM = '0' + MM;
  }
  let result = hh + ':' + mm + ' | ' + DD + '/' + MM + '/' + YYYY;
  return result === 'NaN:NaN | NaN/NaN/NaN' ? '' : result;
};

/**
 * Get current time in seconds
 */
export function getCurrentTime() {
  return Math.round(new Date().getTime() / 1000.0);
}

export const generationTrackingId = () => {
  let tracking_id = Cookies.get('tracking_id');
  if (!tracking_id) {
    tracking_id = generateUUID();
  }
  return tracking_id;
};

export const listenPostMessage = (cb) => {
  var eventMethod = window.addEventListener
    ? 'addEventListener'
    : 'attachEvent';
  var eventer = window[eventMethod];
  var messageEvent = eventMethod == 'attachEvent' ? 'onmessage' : 'message';
  // Listen to message from child window
  eventer(
    messageEvent,
    function (e) {
      // Check if origin is proper
      if (e.origin.indexOf('.fundoo.me') <= -1) {
        return;
      }

      cb(e.data);
    },
    false,
  );
};

const webviewRules = [
  // if it says it's a webview, let's go with that
  'WebView',
  // iOS webview will be the same as safari but missing "Safari"
  '(iPhone|iPod|iPad)(?!.*Safari)',
  // Android Lollipop and Above: webview will be the same as native but it will contain "wv"
  // Android KitKat to lollipop webview will put {version}.0.0.0
  'Android.*(wv|.0.0.0)',
  // old chrome android webview agent
  'Linux; U; Android',
];

const webviewRegExp = new RegExp('(' + webviewRules.join('|') + ')', 'ig');

export const isWebView = (ua = navigator.userAgent) => {
  return !!ua.match(webviewRegExp);
};

export const getMobileOS = () => {
  var userAgent = navigator.userAgent,
    platform = navigator.platform,
    macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
    windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
    iosPlatforms = ['iPhone', 'iPad', 'iPod'],
    os = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'Mac OS';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (!os && /Linux/.test(platform)) {
    os = 'Linux';
  }

  return os;
};
