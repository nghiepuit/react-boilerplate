export default (
  request,
  option,
  timeout = process.env.APP_DEFAULT_API_TIMEOUT,
) => {
  return new Promise(async (resolve, reject) => {
    const timeoutTimer = !!timeout
      ? setTimeout(() => {
          timeoutTimer && clearTimeout(timeoutTimer);
          reject({
            name: 'API_CALL_ERROR',
            status: 499,
            entryPoint: request.toString(),
            option: option,
            message: 'Network timeout',
          });
        }, timeout)
      : null;
    try {
      const fetchResult = await fetch(request, option);
      timeoutTimer && clearTimeout(timeoutTimer);
      resolve(fetchResult);
    } catch (ex) {
      reject(ex);
    }
  });
};
