const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');

const config = require('./config');
const Logger = require('./utils/logger');
const redisClient = require('./services/redisClient');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

class App {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    
    // Compression
    this.app.use(compression());
    
    // CORS
    this.app.use(cors({
      origin: config.nodeEnv === 'production' ? false : true,
      credentials: true
    }));
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Trust proxy for accurate IP addresses
    this.app.set('trust proxy', 1);
    
    // Request logging
  // HTTP Request logging middleware
this.app.use((req, res, next) => {
    const startTime = Date.now();
    
    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function(...args) {
      const responseTime = Date.now() - startTime;
      Logger.httpRequest(req, res, responseTime);
      originalEnd.apply(this, args);
    };
    
    next();
  });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        redis: redisClient.isConnected ? 'connected' : 'disconnected'
      });
    });

    // API routes
    this.app.use('/api', apiRoutes);
   this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found'
      });
    });
  }

  setupErrorHandling() {
    this.app.use(errorHandler);
  }

  getApp() {
    return this.app;
  }
}

module.exports = App;
