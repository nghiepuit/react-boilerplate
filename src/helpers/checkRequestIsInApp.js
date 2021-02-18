import _get from 'lodash-es/get';

export const checkRequestIsInApp = req => {
  const isWebView = false;
  return !!parseInt(isWebView, 10);
};
