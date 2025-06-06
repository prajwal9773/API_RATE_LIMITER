const Logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
    const errorData = {
        level: 'ERROR',
        timestamp: new Date().toISOString(),
        message: 'Unhandled error',
        error: err.message,
        stack: err.stack,
        ip: Logger.getClientIP(req),
        endpoint: req.originalUrl || req.url,
        method: req.method,
        user_agent: req.get('User-Agent') || 'unknown'
      };
      
      console.error(JSON.stringify(errorData));;

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? err.message : 'Something went wrong',
    ...(isDevelopment && { stack: err.stack })
  });
}

module.exports = errorHandler;