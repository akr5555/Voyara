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
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://voyara.onrender.com' 
          : 'http://localhost:10000',
        description: process.env.NODE_ENV === 'production' 
          ? 'Production server' 
          : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'email', 'fullName'],
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
              example: 'user@example.com'
            },
            fullName: {
              type: 'string',
              description: 'User full name',
              example: 'John Doe'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date',
              example: '2026-01-11T10:30:00Z'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          required: ['message', 'accessToken', 'user'],
          properties: {
            message: {
              type: 'string',
              description: 'Response message',
              example: 'Login successful'
            },
            accessToken: {
              type: 'string',
              description: 'JWT access token',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        Destination: {
          type: 'object',
          required: ['id', 'name', 'country'],
          properties: {
            id: {
              type: 'string',
              description: 'Destination ID (UUID)',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            name: {
              type: 'string',
              description: 'Destination name',
              example: 'Eiffel Tower'
            },
            country: {
              type: 'string',
              description: 'Country name',
              example: 'France'
            },
            description: {
              type: 'string',
              description: 'Destination description',
              example: 'Iconic iron lattice tower in Paris'
            },
            image: {
              type: 'string',
              format: 'uri',
              description: 'Image URL',
              example: 'https://example.com/eiffel-tower.jpg'
            },
            latitude: {
              type: 'number',
              format: 'double',
              description: 'Latitude coordinate',
              example: 48.8584,
              minimum: -90,
              maximum: 90
            },
            longitude: {
              type: 'number',
              format: 'double',
              description: 'Longitude coordinate',
              example: 2.2945,
              minimum: -180,
              maximum: 180
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
          required: ['id', 'userId', 'name', 'startDate', 'endDate', 'status'],
          properties: {
            id: {
              type: 'string',
              description: 'Trip ID (UUID)',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            userId: {
              type: 'string',
              description: 'User ID who created the trip'
            },
            name: {
              type: 'string',
              description: 'Trip name',
              example: 'European Adventure 2026'
            },
            description: {
              type: 'string',
              description: 'Trip description',
              example: 'A two-week tour across Europe'
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Trip start date',
              example: '2026-06-01'
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Trip end date',
              example: '2026-06-15'
            },
            coverPhoto: {
              type: 'string',
              format: 'uri',
              description: 'Cover photo URL'
            },
            budget: {
              type: 'number',
              format: 'double',
              description: 'Trip budget',
              example: 5000.00,
              minimum: 0
            },
            status: {
              type: 'string',
              enum: ['planning', 'ongoing', 'completed', 'cancelled'],
              description: 'Trip status',
              default: 'planning'
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
          required: ['id', 'email', 'fullName'],
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
              format: 'uri',
              description: 'Avatar image URL'
            },
            bio: {
              type: 'string',
              description: 'User bio',
              maxLength: 500
            },
            language: {
              type: 'string',
              description: 'Preferred language (ISO 639-1)',
              pattern: '^[a-z]{2}$',
              example: 'en'
            },
            preferences: {
              type: 'object',
              description: 'User preferences (JSON)',
              additionalProperties: true
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
          required: ['id', 'userId', 'destinationId'],
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
              description: 'User notes about the destination',
              maxLength: 1000
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
          required: ['id', 'tripId', 'destinationId', 'visitOrder'],
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
              description: 'Order of visit in the trip',
              minimum: 1
            },
            notes: {
              type: 'string',
              description: 'Notes for this destination in the trip',
              maxLength: 1000
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
          required: ['message'],
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            },
            code: {
              type: 'string',
              description: 'Error code'
            },
            details: {
              type: 'object',
              description: 'Additional error details',
              additionalProperties: true
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints'
      },
      {
        name: 'Users',
        description: 'User profile management'
      },
      {
        name: 'Destinations',
        description: 'Destination management'
      },
      {
        name: 'Trips',
        description: 'Trip planning and management'
      }
    ]
  },
  apis: ['./server/routes/*.js', './server/index.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
