import _transform from 'lodash-es/transform';
import { useCallback, useContext } from 'react';
import DataProviderContext from './Context';

export default function useAction(actions: { [x: string]: any }) {
  const context = useContext(DataProviderContext);
  if (context === null) {
    throw new Error("Can't not find context");
  }
  return _transform(
    actions,
    (acc, value, key) => {
      acc[key] = useCallback(
        (...args: any[]) => {
          return context.dispatch(value(...args));
        },
        [context.dispatch],
      );
    },
    {},
  );
}
