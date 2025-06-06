class Logger {
    static info(message, meta = {}) {
      const logEntry = {
        level: 'INFO',
        timestamp: new Date().toISOString(),
        message,
        ...meta
      };
      console.log(JSON.stringify(logEntry));
    }
  
    static error(message, error = null, meta = {}) {
      const logEntry = {
        level: 'ERROR',
        timestamp: new Date().toISOString(),
        message,
        error: error?.message || error,
        stack: error?.stack,
        ...meta
      };
      console.error(JSON.stringify(logEntry));
    }
  
    static warn(message, meta = {}) {
      const logEntry = {
        level: 'WARN',
        timestamp: new Date().toISOString(),
        message,
        ...meta
      };
      console.warn(JSON.stringify(logEntry));
    }
  
    static debug(message, meta = {}) {
      if (process.env.NODE_ENV === 'development') {
        const logEntry = {
          level: 'DEBUG',
          timestamp: new Date().toISOString(),
          message,
          ...meta
        };
        console.debug(JSON.stringify(logEntry));
      }
    }
  
    // New method for HTTP request logging
    static httpRequest(req, res, responseTime) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        ip: this.getClientIP(req),
        endpoint: req.originalUrl || req.url,
        method: req.method,
        status: res.statusCode,
        response_time_ms: Math.round(responseTime),
        user_agent: req.get('User-Agent') || 'unknown'
      };
      console.log(JSON.stringify(logEntry));
    }
  
    // Helper method to extract client IP
    static getClientIP(req) {
      const forwarded = req.get('X-Forwarded-For');
      if (forwarded) {
        return forwarded.split(',')[0].trim();
      }
      if (req.ip === '::1' || req.ip === '::ffff:127.0.0.1') {
        return '127.0.0.1';
      }
      
      return req.get('X-Real-IP') || 
             req.connection?.remoteAddress || 
             req.socket?.remoteAddress ||
             req.ip ||
             'unknown';
    }
  }
  
  module.exports = Logger;
  