const { env } = require('../config/env');

/**
 * Standard centralized error handling middleware.
 */
function errorHandler(err, req, res, next) {
  // If response already committed, delegate to default express handler
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let fields = err.fields;

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_REQUEST';
    message = `Invalid format for field '${err.path}'`;
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    code = 'CONFLICT';
    const fieldName = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${fieldName} already exists`;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    fields = {};
    for (const [key, value] of Object.entries(err.errors)) {
      fields[key] = [value.message];
    }
  }

  // Handle JWT errors
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Access token expired';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'TOKEN_INVALID';
    message = 'Invalid authentication token';
  }

  // Only log detailed errors in development or for 500 internal errors
  if (env.NODE_ENV === 'development' || statusCode === 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} - ${statusCode} ${code}: ${message}`, err.stack);
  }

  const responseBody = {
    success: false,
    error: {
      code,
      message,
      ...(fields ? { fields } : {})
    }
  };

  return res.status(statusCode).json(responseBody);
}

module.exports = { errorHandler };

