import _isArray from 'lodash-es/isArray';
import _transform from 'lodash-es/transform';

export function removeXSSFromString(value) {
  if (typeof value === 'string') {
    const reg = /<\//g;
    return value.replace(reg, escape('</'));
  }
  return value;
}

export default query => {
  return _transform(query, (result, value, key) => {
    let newValue = value;
    let newKey = removeXSSFromString(key);
    // value is array except 'q'
    if (key !== 'q' && typeof value === 'string' && value.indexOf(',') > -1) {
      newValue = value.split(',');
    }

    if (_isArray(newValue)) {
      result[newKey] = newValue.map(removeXSSFromString);
    } else {
      result[newKey] = removeXSSFromString(newValue);
    }
  });
};
