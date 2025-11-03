const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.status || 500;

  const errorResponse = {
    error: {
      message: err.message || 'Internal Server Error',
      ...(err.errors && { details: err.errors }), // ← add this line
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  };

  logger.error(`Error ${statusCode}: ${err.message}`, {
    path: req.originalUrl,
    method: req.method,
    status: statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    ...(err.errors && { details: err.errors }),
  });

  res.status(statusCode).json(errorResponse);
};

module.exports = { errorMiddleware };