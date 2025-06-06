const RateLimiter = require('../services/rateLimiter');
const Logger = require('../utils/logger');

/**
 * Factory function to create rate limiting middleware
 */
function createRateLimitMiddleware(options = {}) {
  const rateLimiter = new RateLimiter(options.windowMs, options.maxRequests);

  return async (req, res, next) => {
    try {
      // Extract identifier (IP address with optional user identification)
      const identifier = getClientIdentifier(req);
      
      // Check rate limit
      const result = await rateLimiter.isAllowed(identifier);
      
      // Set rate limit headers
      setRateLimitHeaders(res, result);
      
      if (!result.allowed) {
        Logger.warn('Rate limit exceeded', {
            ip: identifier,
            endpoint: req.originalUrl || req.url,
            method: req.method,
            user_agent: req.get('User-Agent') || 'unknown'
          });

        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil(result.windowMs / 1000)
        });
      }

      // Attach rate limit info to request for potential use in handlers
      req.rateLimit = result;
      next();
    } catch (error) {
      Logger.error('Rate limit middleware error', error);
      // Fail open - continue processing request
      next();
    }
  };
}

/**
 * Extract client identifier from request
 */
function getClientIdentifier(req) {
  // Priority: X-Forwarded-For -> X-Real-IP -> connection.remoteAddress
  const forwarded = req.get('X-Forwarded-For');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return req.get('X-Real-IP') || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         req.ip ||
         'unknown';
}

/**
 * Set standard rate limit headers
 */
function setRateLimitHeaders(res, result) {
  res.set({
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
    'X-RateLimit-Window': result.windowMs.toString()
  });

  if (!result.allowed) {
    res.set('Retry-After', Math.ceil(result.windowMs / 1000).toString());
  }
}

module.exports = createRateLimitMiddleware;
