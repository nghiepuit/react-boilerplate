export default metadata => {
  let ret = [];
  if (metadata.index === false) {
    ret.push('NOINDEX');
  } else {
    ret.push('INDEX');
  }
  if (metadata.follow === false) {
    ret.push('NOFOLLOW');
  } else {
    ret.push('FOLLOW');
  }
  return ret.join(',');
};
