const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Voyara Travel API',
      version: '1.0.0',
      description: 'AI-powered travel planning API for Voyara application',
      contact: {
        name: 'Voyara Team',
        email: 'support@voyara.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://voyara.onrender.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./server/routes/*.js', './server/index.js'], // Path to API route files
};

const specs = swaggerJsdoc(options);

module.exports = specs;
