import { createBrowserHistory, createMemoryHistory } from 'history';
import _get from 'lodash-es/get';
import _isEmpty from 'lodash-es/isEmpty';

var _history;

export default () => {
  if (_history) {
    return _history;
  }
  if (__SERVER__) {
    _history = createMemoryHistory();
  } else {
    _history = createBrowserHistory();
  }
  return _history;
};

export const isAppUrl = (url) => {
  var regex = /^https?:\/\/([^.]+\.)?fundoo\.me/;
  return regex.test(url);
};

export const isHistoryEmpty = (historyLength = 0) => {
  let windowHistory = _get(window, 'history', {});
  if (_isEmpty(windowHistory.state)) {
    let referrer = window.document.referrer;
    if (referrer && isAppUrl(referrer)) {
      return false;
    }
  }
  if (historyLength === 0) {
    return true;
  }
  return false;
};
