import React, {
  HTMLAttributes,
  lazy,
  Suspense,
  useEffect,
  useState,
} from 'react';
import { Waypoint } from 'react-waypoint';
import _map from 'lodash/map';

interface ILazyLoadComponent {
  SourceComponent?: React.ElementType;
  LoadedComponent?: React.ElementType;
  useWaypoint: boolean;
  loading: React.ElementType;
  loader: React.ElementType;
}

interface IListLazyLoadComponent {
  [id: string]: ILazyLoadComponent;
}

const lazyLoadComponents: IListLazyLoadComponent = {};

const IS_SERVER = !__CLIENT__;
const IS_CLIENT = !IS_SERVER;

function NullComponent(): React.FunctionComponent {
  return null;
}

/**
 * Retry download component 3 times in 3s
 * @param {*} id
 * @param {*} component
 * @param {*} TOTAL_RETRY
 * @param {*} RETRY_AFTER
 */
function retry(
  id: string,
  component: any,
  TOTAL_RETRY = 3,
  RETRY_AFTER = 3000,
): Promise<any> {
  return new Promise((resolve, reject) => {
    component()
      .then((module: any) => {
        lazyLoadComponents[id].LoadedComponent = module.default;
        resolve(module);
      })
      .catch((error: Error | null) => {
        setTimeout(() => {
          if (TOTAL_RETRY === 1) {
            console.log(`error with id: ${id} - `, error);
            resolve({
              default: NullComponent,
            });
            return;
          }
          retry(id, component, TOTAL_RETRY - 1, RETRY_AFTER).then(
            resolve,
            reject,
          );
        }, RETRY_AFTER);
      });
  });
}

type Props = HTMLAttributes<HTMLElement>;
interface State extends HTMLAttributes<HTMLElement> {
  useWaypoint: boolean;
  error?: boolean;
}

export interface ILazyLoadComponentProps {
  id: string;
  loading: React.ElementType;
  loader: any;
  useWaypoint?: boolean;
  topOffset?: number;
  bottomOffset?: number;
}

export default ({
  id,
  loading: Loading = null,
  loader: SourceComponent,
  useWaypoint = true,
  topOffset = -40,
  bottomOffset = -40,
}: ILazyLoadComponentProps) => {
  if (!lazyLoadComponents[id]) {
    // SSR
    if (IS_SERVER) {
      const LazyLoadComponent = () => {
        const LoadedComponent = lazyLoadComponents[id].LoadedComponent;
        if (!LoadedComponent) {
          return <Loading />;
        }
        return <LoadedComponent />;
      };
      lazyLoadComponents[id] = {
        loading: Loading,
        loader: LazyLoadComponent,
        useWaypoint,
        SourceComponent,
        LoadedComponent: null,
      };
    }
    // CSR
    if (IS_CLIENT) {
      const LazySourceComponent = lazy(() => retry(id, SourceComponent));

      const LazyLoadComponent = (props: Props) => {
        let isLoadedComponent = false;
        const [waypoint, setWaypoint] = useState(
          lazyLoadComponents[id]
            ? lazyLoadComponents[id].useWaypoint
            : useWaypoint,
        );

        useEffect(() => {
          isLoadedComponent = !!lazyLoadComponents[id].LoadedComponent;
        }, []);

        const _handleVisibleOnViewPort = () => {
          lazyLoadComponents[id].useWaypoint = false;
          setWaypoint(false);
        };

        const { loading: isLoading } = lazyLoadComponents[id];
        if (waypoint) {
          return (
            <Waypoint
              onEnter={_handleVisibleOnViewPort}
              topOffset={topOffset}
              bottomOffset={bottomOffset}
              fireOnRapidScroll={false}
            >
              {isLoading ? <Loading empty /> : null}
            </Waypoint>
          );
        }

        if (!isLoadedComponent) {
          return (
            <Suspense fallback={Loading ? <Loading /> : null}>
              <LazySourceComponent {...props} />
            </Suspense>
          );
        }

        const LoadedComponent = lazyLoadComponents[id].LoadedComponent;
        return <LoadedComponent {...props} />;
      };

      lazyLoadComponents[id] = {
        loading: Loading,
        loader: LazyLoadComponent,
        useWaypoint,
        SourceComponent: null,
        LoadedComponent: null,
      };
    }
  }

  return lazyLoadComponents[id].loader;
};

export async function preloadComponent(deep = 0) {
  let loadMore = false;
  await Promise.all(
    _map(lazyLoadComponents, (value, id) => {
      return new Promise(async (resolve) => {
        if (value.SourceComponent) {
          let newComponent = value.SourceComponent();
          lazyLoadComponents[id].SourceComponent = null;
          loadMore = true;
          if (newComponent.then) {
            newComponent.then((module) => {
              lazyLoadComponents[id].LoadedComponent = module.default;
              resolve();
            });
          } else {
            lazyLoadComponents[id].LoadedComponent = newComponent;
            resolve();
          }
        } else {
          resolve();
        }
      });
    }),
  );
  if (loadMore) {
    await preloadComponent(deep + 1);
  }
}
