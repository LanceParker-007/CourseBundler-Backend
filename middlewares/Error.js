const ErrorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || `Inernal server error`;

  res.status().json({
    succes: false,
    message: err.message,
  });
};

export default ErrorMiddleware;
