/**
 * The important logic
 * Warning ! it will affect global of project
 *
 * @module Constant
 */

export const GA_ID = process.env.APP_GA_ID || '';
export const GA_ID_IFRAME = process.env.APP_GA_ID_IFRAME || '';
export const GOOGLE_APP_ID = process.env.APP_GOOGLE_APP_ID || '';
export const APP_GOOGLE_CAPTCHA_PUBLIC_KEY =
  process.env.APP_GOOGLE_CAPTCHA_PUBLIC_KEY || '';
export const GOOGLE_APP_SCOPES =
  process.env.APP_GOOGLE_APP_SCOPES || 'profile email';
export const FB_APP_ID = process.env.APP_FB_APP_ID || '';
export const FB_APP_VERSION = process.env.APP_FB_APP_VERSION || 'v2.4';
export const FB_APP_SCOPES = process.env.APP_FB_APP_SCOPES || 'email';
export const JWT_COOKIE_NAME =
  process.env.APP_JWT_COOKIE_NAME || 'access_token';
export const JWT_HEADER_NAME =
  process.env.APP_JWT_HEADER_NAME || 'access_token';
export const MAX_COOKIE_EXPIRED = 30;
export const CLASS_MODAL_IGNORE_SCROLL = 'modal-ignore-scroll';
export const SENTRY_CLIENT_KEY = process.env.APP_SENTRY_CLIENT_KEY;
export const MAPI_BASENAME = process.env.APP_MAPI_URL;

export const LISTING_PRODUCT_PER_PAGE = 30;
export const MAX_RECENT_PRODUCTS = 20;
export const MAX_RECENT_KEYWORDS = 5;
export const MAX_CATEGORY_NAME_SEARCH_LENGTH = 12;
export const NUMBER_KEYWORD_ADD = 4;
export const PASSWORD_MINLENGTH = 6;
export const PASSWORD_MAXLENGTH = 32;
export const MOBILE_OS_IOS = 'iOS';
export const MOBILE_OS_ANDROID = 'Android';
export const BROWSER_CHROME = 'chrome';
export const BROWSER_FIREFOX = 'firefox';
export const BROWSER_SAFARI = 'safari';
export const BROWSER_IE = 'ie';
export const BROWSER_EDGE = 'edge';
export const LOGIN_TYPE_COOKIE_NAME = 'login_type';
export const LOGIN_ID_COOKIE_NAME = 'login_id';
export const LOGIN_TYPE_USERNAME = 'username';
export const LOGIN_TYPE_FACEBOOK = 'fb';
export const LOGIN_TYPE_GOOGLE = 'gg';
export const FULLNAME_MINLENGTH = 2;
export const FULLNAME_MAXLENGTH = 40;

export const ENABLE_BUYNOW_NOT_LOGIN = false;

export const REGEX_EMAIL = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
export const REGEX_PHONE = /^(01[2689]|09|08[689])[0-9]{8}$/;
export const REGEX_NORMAL_NAME = /^[a-zA-Z0-9\s]*$/;
export const COUNT_DOWN_SECONDE_REGISTER = 60;
export const CITY_CODE_HCM = 1;
export const STATUS_OK = 200;
export const STATUS_REDIRECT = [301, 302];
export const CART_ROUTER = 'gio-hang';
export const ICON_IS_EVENT =
  'https://static.scdn.vn/images/ecom/icon-is-event.svg';

export const API_GET_VERSION = '/__version__';
export const HAVE_UPDATE_MESSAGE_TYPE = 'IS_HAVE_VERSION_UPDATE';
export const CONTENT_TYPE = {
  FORM_DATA: 'form-data',
};
