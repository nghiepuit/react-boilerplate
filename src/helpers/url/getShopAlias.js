export default shopUrl => {
  if (!shopUrl) return null;
  return shopUrl.replace('shop/', '');
};
