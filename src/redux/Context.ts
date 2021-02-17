import * as React from 'react';
import { DataProviderContextValue } from './type';

const DataProviderContext = React.createContext<DataProviderContextValue | null>(
  null,
);

export default DataProviderContext;
