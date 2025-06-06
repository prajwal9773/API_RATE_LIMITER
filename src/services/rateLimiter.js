const config = require('../config');
const redisClient = require('./redisClient');
const Logger = require('../utils/logger');

class RateLimiter {
  constructor(windowMs = config.rateLimit.windowMs, maxRequests = config.rateLimit.maxRequests) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Sliding window rate limiter implementation
   * Uses Redis sorted sets to maintain request timestamps
   */
  async isAllowed(identifier) {
    try {
      const client = redisClient.getClient();
      const now = Date.now();
      const windowStart = now - this.windowMs;
      const key = `rate_limit:${identifier}`;

      // Use Redis transaction for atomicity
      const multi = client.multi();
      
      // Remove expired entries
      multi.zRemRangeByScore(key, '-inf', windowStart);
      
      // Count current requests in window
      multi.zCard(key);
      
      // Add current request
      multi.zAdd(key, { score: now, value: `${now}-${Math.random()}` });
      
      // Set expiration for cleanup
      multi.expire(key, Math.ceil(this.windowMs / 1000));
      
      const results = await multi.exec();
      const currentCount = results[1];

      const allowed = currentCount < this.maxRequests;
      const remaining = Math.max(0, this.maxRequests - currentCount - 1);
      
      // Calculate reset time (next window)
      const resetTime = now + this.windowMs;

      Logger.debug('Rate limit check', {
        identifier,
        currentCount,
        allowed,
        remaining,
        resetTime: new Date(resetTime).toISOString()
      });

      return {
        allowed,
        remaining,
        resetTime,
        limit: this.maxRequests,
        windowMs: this.windowMs
      };
    } catch (error) {
      Logger.error('Rate limiter error', error, { identifier });
      // Fail open - allow request if rate limiter fails
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: Date.now() + this.windowMs,
        limit: this.maxRequests,
        windowMs: this.windowMs,
        error: true
      };
    }
  }

  /**
   * Get current rate limit status without incrementing
   */
  async getStatus(identifier) {
    try {
      const client = redisClient.getClient();
      const now = Date.now();
      const windowStart = now - this.windowMs;
      const key = `rate_limit:${identifier}`;

      // Clean up expired entries and count current requests
      await client.zRemRangeByScore(key, '-inf', windowStart);
      const currentCount = await client.zCard(key);

      return {
        current: currentCount,
        remaining: Math.max(0, this.maxRequests - currentCount),
        limit: this.maxRequests,
        windowMs: this.windowMs,
        resetTime: now + this.windowMs
      };
    } catch (error) {
      Logger.error('Rate limiter status error', error, { identifier });
      return null;
    }
  }
}

module.exports = RateLimiter;