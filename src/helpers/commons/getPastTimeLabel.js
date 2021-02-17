import _memoize from './../memoize';
import formatTimestamp from './formatTimestamp';

export default _memoize(epochTime => {
  if (typeof epochTime !== 'number') {
    return '';
  }
  const diff = Date.now() / 1000 - epochTime;
  if (diff < 3600) {
    const minutes = Math.round(diff / 60);
    return minutes + ' phút trước';
  }
  if (diff < 86400) {
    const hours = Math.round(diff / 3600);
    return hours + ' giờ trước';
  }
  if (diff < 172800) {
    return 'hôm qua';
  }
  return formatTimestamp(epochTime);
});
