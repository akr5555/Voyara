import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import { supabase } from './supabase.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Security Middleware - Configure CSP to allow Supabase and Google Fonts
app.use((req, res, next) => {
  if (req.path.startsWith('/api-docs')) {
    return next();
  }
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          "https://*.supabase.co",
          "https://yrlzcfuubkqdbkwlhjih.supabase.co"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "data:"
        ],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https:",
          "blob:"
        ],
      },
    },
  })(req, res, next);
});

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

// Swagger UI setup - MUST be before other routes
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
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
 * /api/auth/signup:
 *   post:
 *     summary: User signup
 *     description: Register a new user account via Supabase
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
        code: 'MISSING_FIELDS'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters',
        code: 'WEAK_PASSWORD'
      });
    }

    // Real Supabase signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || ''
        }
      }
    });

    if (error) {
      return res.status(400).json({
        message: error.message,
        code: error.code || 'SIGNUP_ERROR'
      });
    }

    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification.',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        fullName: fullName
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user via Supabase and receive an access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Real Supabase login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        message: error.message,
        code: error.code || 'LOGIN_ERROR'
      });
    }

    res.json({
      message: 'Login successful',
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        fullName: data.user?.user_metadata?.full_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logout the current user and invalidate session
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessToken
 *             properties:
 *               accessToken:
 *                 type: string
 *                 description: The user's access token
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful
 */
app.post('/api/auth/logout', async (req, res) => {
  try {
    const { accessToken } = req.body;
    const authHeader = req.headers.authorization;
    const token = accessToken || authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(400).json({
        message: 'Access token is required',
        code: 'MISSING_TOKEN'
      });
    }

    // Real Supabase logout
    const { error } = await supabase.auth.admin.signOut(token);

    if (error) {
      console.error('Logout error:', error);
    }

    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     description: Get the currently authenticated user's profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        message: 'Authorization token is required',
        code: 'MISSING_TOKEN'
      });
    }

    // Get user from Supabase using the token
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    res.json({
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.user_metadata?.full_name,
      createdAt: data.user.created_at
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/destinations:
 *   get:
 *     summary: Get all destinations
 *     description: Retrieve a list of all available travel destinations from the database
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
app.get('/api/destinations', async (req, res) => {
  try {
    // TODO: Replace with actual Supabase query when destinations table is created
    // const { data, error } = await supabase.from('destinations').select('*');
    // if (error) throw error;
    
    // Currently returning mock data - create 'destinations' table in Supabase to use real data
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
  } catch (error) {
    console.error('Get destinations error:', error);
    res.status(500).json({
      message: 'Failed to fetch destinations',
      code: 'SERVER_ERROR'
    });
  }
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
 *     description: Retrieve a list of all upcoming travel trips from the database
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
app.get('/api/trips', async (req, res) => {
  try {
    // TODO: Replace with actual Supabase query when trips table is created
    // const { data, error } = await supabase.from('trips').select('*').gte('start_date', new Date().toISOString());
    // if (error) throw error;
    
    // Currently returning mock data - create 'trips' table in Supabase to use real data
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
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({
      message: 'Failed to fetch trips',
      code: 'SERVER_ERROR'
    });
  }
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

// Important: Static files and catch-all MUST be after all API routes
// Serve static files from the React app (for production)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// The "catchall" handler: for any request that doesn't
// match API or Swagger routes, send back React's index.html file.
// This must be the LAST route - using regex instead of * for Express 5+
app.get(/^(?!\/api)(?!\/api-docs).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📚 Swagger UI available at http://localhost:${PORT}/api-docs`);
  console.log(`🌍 API endpoints available at http://localhost:${PORT}/api`);
});

export default app;
