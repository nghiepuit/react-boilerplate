import Loadable from './../components/Loadable';
import LoadingComponent from './../components/Loading';
import { NOT_FOUND_ROUTE_NAME } from './../helpers/routes';

const NotFoundPage = Loadable({
  id: '@@NotFoundPage',
  loader: () => import('./../pages/404'),
  loading: LoadingComponent,
});

const ROUTE_NAME = '*';

export default {
  path: ROUTE_NAME,
  component: NotFoundPage,
  routeName: NOT_FOUND_ROUTE_NAME,
  chunkName: 'notfound',
  exact: true,
};
