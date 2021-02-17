export default (productUrl, shopAlias) => {
  if (!shopAlias) return productUrl;
  return `shop/${shopAlias}/${productUrl}`;
};
