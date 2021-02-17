import proxy from 'http-proxy-middleware';

export default function useProxyMiddleware(app, proxyConfigs) {
  if (proxyConfigs) {
    for (var route in proxyConfigs) {
      const routeConfig = proxyConfigs[route];
      if (routeConfig.target) {
        app.use(route, proxy(routeConfig));
      } else {
        console.warn(`[HPM] Proxy ${route} without target.`);
      }
    }
  }
}
