const express = require('express');
const createRateLimitMiddleware = require('../middleware/rateLimitMiddleware');
const RateLimiter = require('../services/rateLimiter');
const Logger = require('../utils/logger');

const router = express.Router();

// Apply rate limiting to all API routes
router.use(createRateLimitMiddleware());

// Test endpoints
/**
 * @swagger
 * /test:
 *   get:
 *     summary: Test GET route
 *     responses:
 *       200:
 *         description: API is working
 */
router.get('/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    rateLimit: req.rateLimit ? {
      remaining: req.rateLimit.remaining,
      resetTime: new Date(req.rateLimit.resetTime).toISOString()
    } : null
  });
});

/**
 * @swagger
 * /test:
 *   post:
 *     summary: Test POST route
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: POST request successful
 */

router.post('/test', (req, res) => {
  res.json({
    message: 'POST request successful',
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /rate-limit/status:
 *   get:
 *     summary: Get rate limit status for the current IP
 *     responses:
 *       200:
 *         description: Rate limit status
 */

// Rate limit status endpoint
router.get('/rate-limit/status', async (req, res) => {
  try {
    const rateLimiter = new RateLimiter();
    const identifier = req.ip || 'unknown';
    const status = await rateLimiter.getStatus(identifier);
    
    res.json({
      identifier,
      status: status || 'unavailable',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    Logger.error('Rate limit status endpoint error', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Unable to fetch rate limit status'
    });
  }
});
/**
 * @swagger
 * /heavy:
 *   get:
 *     summary: Simulate heavy load with stricter rate limits
 *     responses:
 *       200:
 *         description: Heavy endpoint response
 */
// Simulate different load patterns for testing
router.get('/heavy', createRateLimitMiddleware({ maxRequests: 5, windowMs: 30000 }), (req, res) => {
  res.json({
    message: 'Heavy endpoint with stricter limits',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;