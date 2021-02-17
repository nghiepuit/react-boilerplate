import _memoize from './../memoize';

export default _memoize((epochTime, format) => {
  if (typeof epochTime !== 'number') return '';
  epochTime = new Date(epochTime * 1000);
  var year = epochTime.getFullYear();
  var month =
    epochTime.getMonth() + 1 > 9
      ? epochTime.getMonth() + 1
      : '0' + (epochTime.getMonth() + 1);
  var date =
    epochTime.getDate() > 9 ? epochTime.getDate() : '0' + epochTime.getDate();

  const hours =
    epochTime.getHours() > 9
      ? epochTime.getHours()
      : '0' + epochTime.getHours();
  const minutes =
    epochTime.getMinutes() > 9
      ? epochTime.getMinutes()
      : '0' + epochTime.getMinutes();

  let ret = format;
  ret = ret.replace('YYYY', year);
  ret = ret.replace('MM', month);
  ret = ret.replace('DD', date);
  ret = ret.replace('HH', hours);
  ret = ret.replace('mm', minutes);
  return ret;
});
