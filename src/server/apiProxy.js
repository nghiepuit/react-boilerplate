function modifyProxyRes(proxyRes, req) {
  const cookies = proxyRes.headers['set-cookie'];
  const re = /domain=([^;]+)/g;

  const replace = 'domain=' + req.hostname;
  if (cookies instanceof Array && cookies.length) {
    for (let i = 0; i < cookies.length; i++) {
      cookies[i] = cookies[i].replace(re, replace);
    }
  }
}

module.exports = () => {
  return {
    [`^/uaa/`]: {
      target: process.env.APP_FUNDOO_API_DOMAIN,
      changeOrigin: true,
      pathRewrite: {
        [`^/uaa/`]: '/',
      },
      onProxyRes: (proxyRes, req, res) => {
        modifyProxyRes(proxyRes, req);
      },
      logLevel: 'silent',
    },
  };
};
