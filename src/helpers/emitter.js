import { EventEmitter } from 'fbemitter';
import _get from 'lodash-es/get';
import Immutable from 'seamless-immutable';
import { get as getCookie } from './../helpers/cookie';
const getUserDataFromStore = (store) => {
  return _get(store, 'data.User.active.data');
};

class PWAEmitter extends EventEmitter {
  _initialized = false;
  window = __SERVER__ ? {} : window;
  init({ store, window }) {
    Object.defineProperty(this, 'store', {
      value: store,
      enumerable: true,
    });
    Object.defineProperty(this, 'window', {
      value: window,
      enumerable: true,
    });
    this._initialized = true;
  }
  session = {};
  saveSession(params = {}) {
    this.session = {
      session_key: Date.now(),
      ...params,
    };
    return this;
  }
  updateSession(params = {}) {
    this.session = {
      ...this.session,
      ...params,
    };
    return this;
  }
  resetSession() {
    this.session = {};
  }
  getSession() {
    return this.session;
  }
  __emitToSubscription(subscription, eventType) {
    setTimeout(() => {
      var args = Array.prototype.slice.call(arguments, 2);
      const store = this.store && this.store.getState();
      args[0] = {
        reactEvent: args[0],
        identity: getUserDataFromStore(store),
        cookies: Immutable({
          tracking_id: getCookie('tracking_id'),
        }),
        session: this.getSession(),
        client_time: Date.now(),
        referrer: this.window.document.referrer,
      };
      for (var i = 1; i < args.length; i++) {
        args[i] = Immutable(args[i]);
      }
      subscription.listener.apply(subscription.context, args);
    });
  }
}

const emitter = new PWAEmitter();

export default emitter;

export const PRODUCT_CLICK = 'PRODUCT_CLICK';
export const PRODUCT_ACCESS = 'PRODUCT_ACCESS';
export const PRODUCT_IN_VIEWPORT = 'PRODUCT_IN_VIEWPORT';

export const CATEGORY_ACCESS = 'CATEGORY_ACCESS';
export const SEARCH_ACCESS = 'SEARCH_ACCESS';
export const HOME_PAGE_ACCESS = 'HOME_PAGE_ACCESS';
export const PAGE_VIEW = 'PAGE_VIEW';

export const IS_LOGGED_IN = 'IS_LOGGED_IN';
export const USER_INFO = 'USER_INFO';
export const PAGE_ACCESS = 'PAGE_ACCESS';
export const NOT_FOUND_PAGE_ACCESS = 'NOT_FOUND_PAGE_ACCESS';
export const HISTORY_REPLACE = 'HISTORY_REPLACE';
export const CLICK_ADDTOCART = 'CLICK_ADDTOCART';
export const CLICK_ADDTOCART_SUCCESS = 'CLICK_ADDTOCART_SUCCESS';
export const CLICK_ADDTOCART_FAILED = 'CLICK_ADDTOCART_FAILED';
export const CLICK_BUYNOW = 'CLICK_BUYNOW';
export const CLICK_BUYNOW_FAILED = 'CLICK_BUYNOW_FAILED';
export const CLICK_BUYNOW_SUCCESS = 'CLICK_BUYNOW_FAILED';
export const CLICK_WISHLIST = 'CLICK_WISHLIST';
export const CLICK_REMOVE_WISHLIST = 'CLICK_REMOVE_WISHLIST';
export const CLICK_LOGIN_GOOGLE = 'CLICK_LOGIN_GOOGLE';
export const CLICK_LOGIN_FACEBOOK = 'CLICK_LOGIN_FACEBOOK';
export const CLICK_CARRIER = 'CLICK_CARRIER';

export const CART_DELETE = 'CART_DELETE';
export const CART_PAGE_ACCESS = 'CART_PAGE_ACCESS';
