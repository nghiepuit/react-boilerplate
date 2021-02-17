export default (url, options = {}) => {
  if (url) {
    url = url.replace(/^https?:\/\//, '//');
  }
  return url;
};
