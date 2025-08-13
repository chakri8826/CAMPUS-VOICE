import { ENV_VARS } from '../config/envVars.js';

export function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default error response
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Server Error';

  // Development error response
  if (ENV_VARS.NODE_ENV === 'development') {
    res.status(statusCode).json({
      success: false,
      error: message,
      stack: err.stack,
      details: {
        name: err.name,
        code: err.code,
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
      }
    });
  } else {
    // Production error response
    res.status(statusCode).json({
      success: false,
      error: statusCode === 500 ? 'Server Error' : message
    });
  }
}