/**
 * Note
 * 1. Handle write cookie for multiple env
 *    domain: sandbox.fundoo.me = .sandbox.fundoo.me
 *    domain: www.fundoo.me = .fundoo.me
 * @param {String} hostname
 * @param {String} withDot
 */
export default (hostname, withDot = false) => {
  let arrHostNames = hostname.split('.');
  if (arrHostNames.length === 1) {
    return arrHostNames[0];
  }
  var prefix = '';
  if (arrHostNames.length > 2 && arrHostNames[0] === 'www') {
    arrHostNames = arrHostNames.splice(arrHostNames.length - 2);
  }
  if (withDot) {
    prefix = '.';
  }
  var base = arrHostNames.join('.');
  return prefix + base;
};
