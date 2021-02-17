import _memoize from './../memoize';

export default _memoize(epochTime => {
  if (typeof epochTime !== 'number') return '';
  epochTime = new Date(epochTime * 1000);
  var year = epochTime.getFullYear();
  var month =
    epochTime.getMonth() + 1 > 9
      ? epochTime.getMonth() + 1
      : '0' + (epochTime.getMonth() + 1);
  var date =
    epochTime.getDate() > 9 ? epochTime.getDate() : '0' + epochTime.getDate();
  return `${date}/${month}/${year}`;
});
