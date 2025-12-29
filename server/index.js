const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Basic Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Voyara API Documentation'
}));

// API Routes
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/destinations:
 *   get:
 *     summary: Get all destinations
 *     description: Retrieve a list of all available travel destinations
 *     tags: [Destinations]
 *     responses:
 *       200:
 *         description: A list of destinations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Destination'
 */
app.get('/api/destinations', (req, res) => {
  const destinations = [
    {
      id: '1',
      name: 'Paris',
      country: 'France',
      description: 'The City of Light awaits with iconic landmarks and rich culture',
      image: '/placeholder.svg',
      rating: 4.8
    },
    {
      id: '2',
      name: 'Tokyo',
      country: 'Japan',
      description: 'Experience the perfect blend of tradition and modernity',
      image: '/placeholder.svg',
      rating: 4.9
    },
    {
      id: '3',
      name: 'New York',
      country: 'USA',
      description: 'The city that never sleeps offers endless possibilities',
      image: '/placeholder.svg',
      rating: 4.7
    }
  ];
  res.json(destinations);
});

/**
 * @swagger
 * /api/destinations/{id}:
 *   get:
 *     summary: Get destination by ID
 *     description: Retrieve detailed information about a specific destination
 *     tags: [Destinations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Destination ID
 *     responses:
 *       200:
 *         description: Destination details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Destination'
 *       404:
 *         description: Destination not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/destinations/:id', (req, res) => {
  const { id } = req.params;
  // Mock response - integrate with your database
  const destination = {
    id,
    name: 'Paris',
    country: 'France',
    description: 'The City of Light awaits with iconic landmarks and rich culture',
    image: '/placeholder.svg',
    rating: 4.8
  };
  res.json(destination);
});

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Get all upcoming trips
 *     description: Retrieve a list of all upcoming travel trips
 *     tags: [Trips]
 *     responses:
 *       200:
 *         description: A list of trips
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trip'
 */
app.get('/api/trips', (req, res) => {
  const trips = [
    {
      id: '1',
      title: 'Paris Adventure',
      destination: 'Paris, France',
      startDate: '2025-03-15',
      endDate: '2025-03-22',
      price: 1299,
      availableSeats: 12
    },
    {
      id: '2',
      title: 'Tokyo Explorer',
      destination: 'Tokyo, Japan',
      startDate: '2025-04-10',
      endDate: '2025-04-20',
      price: 2499,
      availableSeats: 8
    }
  ];
  res.json(trips);
});

/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Get trip by ID
 *     description: Retrieve detailed information about a specific trip
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     responses:
 *       200:
 *         description: Trip details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 *       404:
 *         description: Trip not found
 */
app.get('/api/trips/:id', (req, res) => {
  const { id } = req.params;
  const trip = {
    id,
    title: 'Paris Adventure',
    destination: 'Paris, France',
    startDate: '2025-03-15',
    endDate: '2025-03-22',
    price: 1299,
    availableSeats: 12
  };
  res.json(trip);
});

// Serve static files from the React app (for production)
app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📚 Swagger UI available at http://localhost:${PORT}/api-docs`);
  console.log(`🌍 API endpoints available at http://localhost:${PORT}/api`);
});

module.exports = app;
