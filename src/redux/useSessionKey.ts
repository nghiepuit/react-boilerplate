import { useContext } from 'react';
import DataProviderContext from './Context';

export default function useSessionKey() {
  const context = useContext(DataProviderContext);
  if (!context) {
    return {
      getSessionKey: () => -1,
    };
  }
  return {
    getSessionKey: context.getSessionKey,
  };
}
