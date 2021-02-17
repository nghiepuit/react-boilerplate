import Loadable from './../components/Loadable';
import LoadingComponent from './../components/Loading';
import { HOME_ROUTE_NAME } from './../helpers/routes';

const HomePage = Loadable({
  id: '@@HomePage',
  loader: () => import('./../pages/HomePage'),
  loading: LoadingComponent,
});

export default {
  path: '/',
  component: HomePage,
  routeName: HOME_ROUTE_NAME,
  chunkName: 'home',
  exact: true,
};
