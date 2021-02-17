import * as React from 'react';
import DataProviderContext from './Context';
import { REDUCER_NAME } from './const';
import {
  DataProviderProps,
  DataProviderState,
  DataProviderContextValue,
  Storage,
} from './type';

export default class DataProvider extends React.Component<
  DataProviderProps,
  DataProviderState
> {
  contextValue: DataProviderContextValue;
  storages: { [x: string]: Storage };

  constructor(props: DataProviderProps) {
    super(props);
    this.contextValue = this.buildAppContextValue();
    this.storages = (props.storages || []).reduce((result, storage) => {
      const Constructor = storage[1];
      result[storage[0]] = new Constructor(props.req, props.res);
      return result;
    }, {});
  }

  buildAppContextValue(): DataProviderContextValue {
    const store = this.props.store;
    return {
      getState: () => {
        return store.getState()[REDUCER_NAME];
      },
      getSessionKey: () => {
        const tracking = store.getState().tracking;
        return tracking && tracking.sessionKey;
      },
      dispatch: store.dispatch,
      getStorage: name => this.storages[name],
      subscribe: store.subscribe,
      ignoreEffect: this.props.ignoreEffect,
      promiseCollecter: this.props.promiseCollecter,
      fetchParamsCollector: this.props.fetchParamsCollector,
      renderResult: (this.props.renderResult ||
        {}) as any,
    };
  }

  componentDidUpdate(prevProps: DataProviderProps) {
    if (
      prevProps.store !== this.props.store ||
      this.props.settings !== this.props.settings
    ) {
      this.contextValue = this.buildAppContextValue();
      this.forceUpdate();
    }
  }

  public render() {
    return (
      <DataProviderContext.Provider value={this.contextValue}>
        {this.props.children}
      </DataProviderContext.Provider>
    );
  }
}
