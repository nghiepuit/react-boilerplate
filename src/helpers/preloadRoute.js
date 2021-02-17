import _get from 'lodash-es/get';

export default async (routes, currentPath, store) => {
  const historyState = _get(store.getState(), [
    '@',
    'data',
    'History',
    '_',
    '_',
    'data',
  ]);

  const routeFilter = route => route.routeName === historyState.routeName;
  const matchedRoute = historyState && routes.find(routeFilter);
  if (!matchedRoute) {
    return;
  }
  const component = matchedRoute.component;
  if (process.env.NODE_ENV !== 'production') {
    if (matchedRoute.onRender instanceof Function) {
      matchedRoute.onRender(store.dispatch, historyState);
    }
  }
  if (component.preload instanceof Function) {
    await component.preload();
  }
};
