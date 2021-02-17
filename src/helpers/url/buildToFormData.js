export default params => {
  if (!window.FormData) {
    console.log('FormData does not supported');
    return params;
  }
  let form = new window.FormData();
  for (var name in params) {
    form.append(name, params[name]);
  }
  return form;
};
