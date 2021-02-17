import { Dispatch, Store, Unsubscribe } from 'redux';
import { ImmutableObject } from 'seamless-immutable';

export interface DataProviderContextValue {
  getStorage(name: string): Storage | undefined;
  getState(): State;
  getSessionKey: () => number;
  dispatch: Dispatch;
  subscribe: (callback: () => void) => Unsubscribe;
  ignoreEffect?: boolean;
  promiseCollecter?: Promise<any>[];
  fetchParamsCollector?: any[];
  renderResult: {
    redirectUrl?: string;
    isRedirected?: boolean;
    code: number;
    fetchs?: any;
    isSetCookie?: boolean;
  };
}

export interface RedirectData {
  redirectUrl?: string;
}

export interface ApplicationContext {
  getState(): State;
}

export interface Storages {
  [x: string]: Storage;
}

export interface Storage {
  get(key: string): string;
  getNumber(key: string): number;
  getObject<T extends Object>(key: string): T | undefined;

  set(key: string, value: any, options: any): void;
}

export interface StorageConstructor {
  new (req: Express.Request, res: Express.Response): Storage;
}

export interface Setting {
  [x: string]: any;
}

export type State = ImmutableObject<MutableState>;

export type MutableState = {
  data: StoreData;
  observedBits: number;
};

export interface StoreData {
  [uri: string]: {
    time: number;
    data: {
      [type: string]: {
        [alias: string]: ConnectedData<any>;
      };
    };
  };
}

export enum DATA_STATUS {
  INIT = 0,
  PENDING = 1,
  ERROR = 2,
  NOT_FOUND = 3,
  REDIRECT = 4,
  SUCCESS = 5,
}

export interface DataProviderProps {
  store: Store<any>;
  settings: Setting;
  storages: [string, StorageConstructor][];
  ignoreEffect?: boolean;
  promiseCollecter: Promise<any>[];
  fetchParamsCollector: any[];
  renderResult: {
    redirectUrl?: string;
  };
  req: Express.Request;
  res: Express.Response;
}

export interface DataProviderState {}

export interface ConnectedData<T, M extends Object = {}> {
  __default__?: boolean;
  data: T;
  status: DATA_STATUS;
  meta: M;
  version: number;
}

export type DataSourceDeps<DT> = DataSource<DT>[];

export type DataSourceUri<P, DT> =
  | string
  | ((params?: P, deps?: ConnectedData<DT>[]) => string);

export interface DataSource<T, P = any, DT = any> {
  type: string;
  alias?: string;
  deps?: DataSourceDeps<DT>;
  uri?: DataSourceUri<P, DT>;
  service: DataService;
  params?: Object | ((params?: P, deps?: ConnectedData<DT>[]) => Object);
  default: T;
  strategy?: Strategy<T, P>;
  onResponse: onReponseHandler<T, P, DT>;
  onError?: onErrorHandler<T, P, DT>;
  onPending?: onPendingHandler<T, P, DT>;
  onRedirect?: onRedirectHandler<T, P, DT>;
  ssr?: boolean;
  keepOldData?: boolean;
  debug?: boolean;
  actions: any[];
  shouldParamsUpdate: any;
  isPrimaryService: boolean;
}

export interface GetterResult<T, P, DT = any> {
  current: ConnectedData<T>;
  uri?: string;
  params: P | undefined;
  deps?: ConnectedData<DT>[];
  depsStatus: DATA_STATUS;
}

export interface Strategy<T, P> {
  shouldFetch(current: GetterResult<T, P>): boolean;
}

export interface APIResponse {
  status: number;
  body: any;
}

export interface DataService {
  fetch(
    params: any,
    onPending: () => void,
    onResponse: (body: APIResponse) => void,
    onError: (error: Error) => void,
    context: DataProviderContextValue,
  ): Promise<any>;
}

export type onPendingHandler<T, P, DT> = (
  current: ConnectedData<T>,
  params?: P,
  refetch?: boolean,
  deps?: ConnectedData<DT>[],
  sessionKey?: number,
) => StoreUpdate | StoreUpdate[];

export type onReponseHandler<T, P, DT> = (
  body: any,
  current: ConnectedData<T>,
  params?: P,
  refetch?: boolean,
  deps?: ConnectedData<DT>[],
  sessionKey?: number,
) => StoreUpdate | StoreUpdate[];

export type onRedirectHandler<T, P, DT> = (
  body: any,
  current: ConnectedData<T>,
  params?: P,
  refetch?: boolean,
  deps?: ConnectedData<DT>[],
  sessionKey?: number,
) => StoreUpdate | StoreUpdate[];

export type onErrorHandler<T, P, DT> = (
  error: Error,
  current: ConnectedData<T>,
  params?: P,
  refetch?: boolean,
  deps?: ConnectedData<DT>[],
  sessionKey?: number,
) => StoreUpdate | StoreUpdate[];

export type StoreUpdate<T = any> = Partial<ConnectedData<T>> & {
  uri?: string;
  type?: string;
  alias?: string;
};

export type NormalizeStoreUpdate<T = any> = ConnectedData<T> & {
  type: string;
  alias: string;
  uri: string;
};

export type StoreUpdateAction = {
  type: '@@action/UPDATE_STORE';
  uri: string;
  observedBits: number;
  payload: NormalizeStoreUpdate[];
};
