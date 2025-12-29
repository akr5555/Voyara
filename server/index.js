const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger UI Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Voyara API Documentation',
}));

// Example API Routes with Swagger Documentation

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API
 *     tags: [Health]
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
 * /api/trips:
 *   get:
 *     summary: Get all trips
 *     description: Retrieve a list of all available trips
 *     tags: [Trips]
 *     responses:
 *       200:
 *         description: List of trips
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   destination:
 *                     type: string
 *                   duration:
 *                     type: string
 *                   price:
 *                     type: number
 */
app.get('/api/trips', (req, res) => {
  res.json([
    {
      id: 1,
      title: 'European Adventure',
      destination: 'Europe',
      duration: '15 days',
      price: 2500
    },
    {
      id: 2,
      title: 'Tokyo Explorer',
      destination: 'Tokyo, Japan',
      duration: '10 days',
      price: 3000
    }
  ]);
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
 *           type: integer
 *         description: Trip ID
 *     responses:
 *       200:
 *         description: Trip details
 *       404:
 *         description: Trip not found
 */
app.get('/api/trips/:id', (req, res) => {
  const { id } = req.params;
  // Example response
  res.json({
    id: parseInt(id),
    title: 'European Adventure',
    destination: 'Europe',
    duration: '15 days',
    price: 2500,
    itinerary: []
  });
});

/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: Create a new trip
 *     description: Create a new trip with AI-powered itinerary generation
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - destination
 *               - duration
 *               - budget
 *             properties:
 *               destination:
 *                 type: string
 *                 example: Paris, France
 *               duration:
 *                 type: string
 *                 example: 7 days
 *               budget:
 *                 type: number
 *                 example: 2000
 *               preferences:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Trip created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
app.post('/api/trips', (req, res) => {
  const { destination, duration, budget } = req.body;
  res.status(201).json({
    id: 3,
    destination,
    duration,
    budget,
    status: 'created'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Voyara API',
    documentation: '/api-docs'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;
