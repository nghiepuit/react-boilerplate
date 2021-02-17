export default url => {
  var regex = /^https?:\/\/([^.]+\.)?fundoo\.me/;
  return regex.test(url);
};
