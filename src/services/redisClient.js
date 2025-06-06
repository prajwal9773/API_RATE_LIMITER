const redis = require('redis');
const config = require('../config');
const Logger = require('../utils/logger');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = redis.createClient({
        url: config.redis.url,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
        }
      });

      this.client.on('error', (err) => {
        Logger.error('Redis Client Error', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        Logger.info('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        Logger.warn('Redis Client Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      Logger.error('Failed to connect to Redis', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
       this.client.destroy();
      this.isConnected = false;
      Logger.info('Redis Client Disconnected');
    }
  }

  getClient() {
    if (!this.isConnected || !this.client) {
      throw new Error('Redis client is not connected');
    }
    return this.client;
  }
}

module.exports = new RedisClient();
