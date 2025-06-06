// src/docs/swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rate Limiting API',
      version: '1.0.0',
      description: 'API for testing rate limiting middleware',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // adjust path based on where your routes live
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
