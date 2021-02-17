import { useContext } from 'react';
import _get from 'lodash-es/get';
import _pickBy from 'lodash-es/pickBy';
import _flatten from 'lodash-es/flatten';
import _identity from 'lodash-es/identity';
import _map from 'lodash-es/map';

import { DataSource, GetterResult } from './type';
import DataProviderContext from './Context';
import updateStore from './updateStore';

function getCookies(_data: any) {
  if (!_data) {
    return [];
  }
  let data = _data;
  if (!Array.isArray(data)) {
    data = [_data];
  }

  return _flatten(data.map(f => _get(f, ['meta', 'cookie'])).filter(Boolean));
}

export default function createFetcher<T, P, DT>(config: DataSource<T, P, DT>) {
  return (getter: GetterResult<T, P>) => {
    const context = useContext(DataProviderContext);
    if (context === null) {
      return;
    }

    const cookie = context.getStorage('cookie');

    const actions = config.actions.reduce((result: Object, action) => {
      result[action.name] = (params?: Object) => {
        const uri = getter.uri;
        const actionParams =
          !!getter.params || !!params
            ? ({ ...getter.params, ...params } as P)
            : undefined;

        const fetcherParams =
          typeof action.params === 'function'
            ? action.params(actionParams, getter.deps)
            : { ...action.params, ...params };

        action.service.fetch(
          fetcherParams,
          () => {
            if (!!action.onPending) {
              const data = action.onPending(
                getter.current,
                actionParams,
                true, // reFetch
                getter.deps,
                undefined, // sessionKey
              );
              data &&
                context.dispatch(
                  updateStore(data, uri, config.type, config.alias), // same type, uri, alias
                );
            }
          },
          res => {
            try {
              const data = action.onResponse(
                res.body,
                getter.current,
                actionParams,
                true, // refetch
                getter.deps,
                undefined, // sessionKey
              );

              if (res.status !== 200) {
                throw new Error(
                  `[API ERROR] code:${res.status} - entry: ${fetcherParams.entry}`,
                );
              }

              const cookies: any[] = getCookies(data);
              if (cookie) {
                cookies.map(setCookie => {
                  cookie.set(
                    setCookie.key,
                    setCookie.value,
                    _pickBy(
                      {
                        expires: setCookie.expires,
                        httpOnly: setCookie.httpOnly,
                        path: setCookie.path,
                      },
                      _identity,
                    ),
                  );
                });
              }

              data &&
                requestAnimationFrame(() => {
                  context.dispatch(
                    updateStore(data, uri, config.type, config.alias),
                  );
                });
            } catch (error) {
              if (!!action.onError) {
                context.dispatch(
                  updateStore(
                    action.onError(
                      error,
                      getter.current,
                      actionParams,
                      true, // refetch
                      getter.deps,
                      undefined, // sessionKey
                    ),
                    uri,
                    config.type,
                    config.alias,
                  ),
                );
              }
            }
          },
          error => {
            if (!!config.onError) {
              const data = action.onError(
                error,
                getter.current,
                actionParams,
                true, // refetch
                getter.deps,
                undefined, // sessionKey
              );
              data &&
                context.dispatch(
                  updateStore(data, uri, config.type, config.alias),
                );
            }
          },
          context,
        );
      };

      return result;
    }, {});

    return actions;
  };
}
