import swaggerJsdoc from 'swagger-jsdoc';

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
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            fullName: {
              type: 'string',
              description: 'User full name'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Response message'
            },
            accessToken: {
              type: 'string',
              description: 'JWT access token'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        Destination: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Destination ID (UUID)'
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
            latitude: {
              type: 'number',
              description: 'Latitude coordinate'
            },
            longitude: {
              type: 'number',
              description: 'Longitude coordinate'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            }
          }
        },
        Trip: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Trip ID (UUID)'
            },
            userId: {
              type: 'string',
              description: 'User ID who created the trip'
            },
            name: {
              type: 'string',
              description: 'Trip name'
            },
            description: {
              type: 'string',
              description: 'Trip description'
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
            coverPhoto: {
              type: 'string',
              description: 'Cover photo URL'
            },
            budget: {
              type: 'number',
              description: 'Trip budget'
            },
            status: {
              type: 'string',
              enum: ['planning', 'ongoing', 'completed', 'cancelled'],
              description: 'Trip status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        UserProfile: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID (same as auth user)'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            fullName: {
              type: 'string',
              description: 'User full name'
            },
            avatarUrl: {
              type: 'string',
              description: 'Avatar image URL'
            },
            bio: {
              type: 'string',
              description: 'User bio'
            },
            language: {
              type: 'string',
              description: 'Preferred language (ISO 639-1)'
            },
            preferences: {
              type: 'object',
              description: 'User preferences (JSON)'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date'
            }
          }
        },
        SavedDestination: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Saved destination ID'
            },
            userId: {
              type: 'string',
              description: 'User ID'
            },
            destinationId: {
              type: 'string',
              description: 'Destination ID'
            },
            notes: {
              type: 'string',
              description: 'User notes about the destination'
            },
            savedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the destination was saved'
            },
            destinations: {
              $ref: '#/components/schemas/Destination'
            }
          }
        },
        TripDestination: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Trip destination ID'
            },
            tripId: {
              type: 'string',
              description: 'Trip ID'
            },
            destinationId: {
              type: 'string',
              description: 'Destination ID'
            },
            visitOrder: {
              type: 'integer',
              description: 'Order of visit in the trip'
            },
            notes: {
              type: 'string',
              description: 'Notes for this destination in the trip'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
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

export default swaggerSpec;
