import { DataSource, ConnectedData } from './type';

export default function createSetter<T, P, DT>(config: DataSource<T, P, DT>) {
  return () => {
    return (path: string[], value: any) => {
      console.log('a');
    };
  };
}
