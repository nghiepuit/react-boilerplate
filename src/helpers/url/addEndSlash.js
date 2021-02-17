export default url => {
  if (/\.html?\//.test(url)) {
    return url.replace(/(\.html?)\//, '$1');
  }
  if (/\.html?/.test(url)) {
    return url;
  }
  if (/\/(\?|#)/.test(url)) {
    return url;
  }
  if (/\?|#/.test(url)) {
    return url.replace(/(\?|#)/, '/$1');
  }
  if (/\/$/.test(url)) {
    return url;
  }
  return url + '/';
};
