export default (err, req, res, next) => {
  global['console'].error(err.stack);
  res.status(500).send('Something was wrong');
};
