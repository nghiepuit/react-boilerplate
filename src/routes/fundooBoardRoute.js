import Loadable from './../components/Loadable';
import LoadingComponent from './../components/Loading';
import { FUNDOO_BOARD, FUNDOO_BOARD_ROUTE_NAME } from './../helpers/routes';

const FundooBoardPage = Loadable({
  id: '@@FundooBoardPage',
  loader: () =>
    import('./../pages/FundooBoardPage' /* webpackChunkName: "fundooBoard" */),
  loading: LoadingComponent,
});

export default {
  path: FUNDOO_BOARD.path,
  component: FundooBoardPage,
  routeName: FUNDOO_BOARD_ROUTE_NAME,
  chunkName: 'fundooBoard',
  exact: true,
};
