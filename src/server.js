const config = require('./config');
const Logger = require('./utils/logger');
const redisClient = require('./services/redisClient');
const App = require('./app');


class Server {
  constructor() {
    this.app = new App().getApp();
    this.server = null;
  }

  async start() {
    try {
      // Connect to Redis
      await redisClient.connect();
      Logger.info('Connected to Redis successfully');

      // Start HTTP server
      this.server = this.app.listen(config.port, () => {
        Logger.info(`Server running on port ${config.port}`, {
          environment: config.nodeEnv,
          port: config.port
        });
      });

      // Graceful shutdown handling
      this.setupGracefulShutdown();

    } catch (error) {
      Logger.error('Failed to start server', error);
      process.exit(1);
    }
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      Logger.info(`Received ${signal}, shutting down gracefully`);
      
      if (this.server) {
        this.server.close(async () => {
          Logger.info('HTTP server closed');
          
          try {
            await redisClient.disconnect();
            Logger.info('Redis connection closed');
            process.exit(0);
          } catch (error) {
            Logger.error('Error during shutdown', error);
            process.exit(1);
          }
        });
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new Server();
  server.start();
}

module.exports = Server;