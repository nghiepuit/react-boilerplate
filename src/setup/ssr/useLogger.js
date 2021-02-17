const useLogger = (app) => {
  app.use(require('morgan')(':method :url :status :res[content-length] - :response-time ms'));
};

export default useLogger;
