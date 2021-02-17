import _memoize from 'lodash-es/memoize';

export default (rawFunction, resolver) => {
  if (__SERVER__) {
    return rawFunction;
  }
  return _memoize(rawFunction, resolver);
};
