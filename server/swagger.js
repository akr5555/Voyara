const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Voyara API Documentation',
      version: '1.0.0',
      description: 'API documentation for Voyara - Your Travel Companion',
      contact: {
        name: 'Voyara Team',
        email: 'support@voyara.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:10000',
        description: 'Development server'
      },
      {
        url: 'https://voyara.onrender.com',
        description: 'Production server'
      }
    ],
    components: {
      schemas: {
        Destination: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Destination ID'
            },
            name: {
              type: 'string',
              description: 'Destination name'
            },
            country: {
              type: 'string',
              description: 'Country name'
            },
            description: {
              type: 'string',
              description: 'Destination description'
            },
            image: {
              type: 'string',
              description: 'Image URL'
            },
            rating: {
              type: 'number',
              description: 'Rating (0-5)'
            }
          }
        },
        Trip: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Trip ID'
            },
            title: {
              type: 'string',
              description: 'Trip title'
            },
            destination: {
              type: 'string',
              description: 'Destination name'
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Trip start date'
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Trip end date'
            },
            price: {
              type: 'number',
              description: 'Trip price'
            },
            availableSeats: {
              type: 'number',
              description: 'Available seats'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            },
            code: {
              type: 'string',
              description: 'Error code'
            }
          }
        }
      }
    }
  },
  apis: ['./server/routes/*.js', './server/index.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
