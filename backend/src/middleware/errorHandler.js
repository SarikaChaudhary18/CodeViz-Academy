const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  const errorResponse = {
    status: 'error',
    statusCode,
    message: err.message || 'Internal Server Error'
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }

  // Log error with Winston
  logger.error(
    `Error on ${req.method} ${req.originalUrl}: Code ${statusCode} - Message: ${err.message}`, 
    { stack: err.stack, ip: req.ip }
  );

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
