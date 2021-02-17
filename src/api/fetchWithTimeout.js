export default (timeout, ...args) => {
  return new Promise(async (resolve, reject) => {
    let timeoutTimer = setTimeout(() => {
      clearTimeout(timeoutTimer);
      reject({
        name: 'API_CALL_ERROR',
        status: 499,
        entryPoint: args[0],
        option: args[1],
        message: 'Network timeout',
      });
    }, timeout || process.env.APP_DEFAULT_API_TIMEOUT);
    try {
      const fetchResult = await fetch(...args);
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
        resolve(fetchResult);
      }
    } catch (ex) {
      reject(ex);
    }
  });
};
