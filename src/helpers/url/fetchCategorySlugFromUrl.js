export default (category_param = {}) => {
  let match = '';
  if (typeof category_param.cate1 !== 'undefined')
    match += category_param.cate1 + '/';
  if (typeof category_param.cate2 !== 'undefined')
    match += category_param.cate2;

  return match;
};
