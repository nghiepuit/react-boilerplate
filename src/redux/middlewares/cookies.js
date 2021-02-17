import Cookie from 'universal-cookie';
import _isArray from 'lodash-es/isArray';

const getInputCookies = (action) => {
  if (!action.payload) {
    return [];
  }

  return _isArray(action.payload) ? action.payload : [action.payload];
};

export default (store) => (next) => (action) => {
  if (action.type === '@@cookies/SET') {
    const hour = 3600000;
    const cookies = getInputCookies(action);

    cookies.map((c) => {
      Cookie.set(c.key, c.value, {
        expires: new Date(Date.now() + c.options.expires * hour),
      });
    });
  }
  return next(action);
};
