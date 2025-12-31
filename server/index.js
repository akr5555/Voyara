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
 *     parameters:
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, country, or description
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
    let query = supabase.from('destinations').select('*');

    // Apply filters
    if (req.query.country) {
      query = query.eq('country', req.query.country);
    }

    if (req.query.search) {
      const searchTerm = `%${req.query.search}%`;
      query = query.or(`name.ilike.${searchTerm},country.ilike.${searchTerm},description.ilike.${searchTerm}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Get destinations error:', error);
      return res.status(500).json({
        message: 'Failed to fetch destinations',
        code: 'DATABASE_ERROR'
      });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Get destinations error:', error);
    res.status(500).json({
      message: 'Internal server error',
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
app.get('/api/destinations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        message: 'Destination not found',
        code: 'NOT_FOUND'
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Get destination error:', error);
    res.status(500).json({
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Get user's trips
 *     description: Retrieve all trips created by the authenticated user
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planning, ongoing, completed, cancelled]
 *         description: Filter by trip status
 *     responses:
 *       200:
 *         description: List of user's trips
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trip'
 *       401:
 *         description: Unauthorized
 */
app.get('/api/trips', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        message: 'Authorization token is required',
        code: 'MISSING_TOKEN'
      });
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    // Build query
    let query = supabase
      .from('trips')
      .select(`
        *,
        trip_destinations (
          destination_id,
          destinations (
            id,
            name,
            country,
            image
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply status filter if provided
    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Get trips error:', error);
      return res.status(500).json({
        message: 'Failed to fetch trips',
        code: 'DATABASE_ERROR'
      });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: Create a new trip
 *     description: Create a new travel trip for the authenticated user
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
 *               - name
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 example: Summer Europe Tour
 *               description:
 *                 type: string
 *                 example: A memorable journey through European cities
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-07-01
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-07-15
 *               coverPhoto:
 *                 type: string
 *                 example: https://example.com/photo.jpg
 *               budget:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       201:
 *         description: Trip created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier (UUID) of the created trip
 *                   example: 550e8400-e29b-41d4-a716-446655440000
 *                 user_id:
 *                   type: string
 *                   description: User ID who created the trip
 *                   example: 123e4567-e89b-12d3-a456-426614174000
 *                 name:
 *                   type: string
 *                   example: Summer Europe Tour
 *                 description:
 *                   type: string
 *                   example: A memorable journey through European cities
 *                 start_date:
 *                   type: string
 *                   format: date
 *                   example: 2025-07-01
 *                 end_date:
 *                   type: string
 *                   format: date
 *                   example: 2025-07-15
 *                 cover_photo:
 *                   type: string
 *                   example: https://example.com/photo.jpg
 *                 budget:
 *                   type: number
 *                   example: 5000
 *                 status:
 *                   type: string
 *                   enum: [planning, ongoing, completed, cancelled]
 *                   example: planning
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-01-15T10:30:00Z
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-01-15T10:30:00Z
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
app.post('/api/trips', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        message: 'Authorization token is required',
        code: 'MISSING_TOKEN'
      });
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    const { name, description, startDate, endDate, coverPhoto, budget } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({
        message: 'Name, start date, and end date are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Create trip in database
    const { data, error } = await supabase
      .from('trips')
      .insert({
        user_id: user.id,
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        cover_photo: coverPhoto,
        budget,
        status: 'planning'
      })
      .select()
      .single();

    if (error) {
      console.error('Create trip error:', error);
      return res.status(500).json({
        message: 'Failed to create trip',
        code: 'DATABASE_ERROR'
      });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({
      message: 'Internal server error',
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

/**
 * @swagger
 * /api/trips/{id}:
 *   put:
 *     summary: Update a trip
 *     description: Update an existing trip (user must be the owner)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               coverPhoto:
 *                 type: string
 *               budget:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [planning, ongoing, completed, cancelled]
 *     responses:
 *       200:
 *         description: Trip updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the trip owner
 *       404:
 *         description: Trip not found
 */
app.put('/api/trips/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        message: 'Authorization token is required',
        code: 'MISSING_TOKEN'
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    const { id } = req.params;
    const { name, description, startDate, endDate, coverPhoto, budget, status } = req.body;

    // Check if trip exists and user is owner
    const { data: existingTrip, error: fetchError } = await supabase
      .from('trips')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingTrip) {
      return res.status(404).json({
        message: 'Trip not found',
        code: 'NOT_FOUND'
      });
    }

    if (existingTrip.user_id !== user.id) {
      return res.status(403).json({
        message: 'You do not have permission to update this trip',
        code: 'FORBIDDEN'
      });
    }

    // Update trip
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.start_date = startDate;
    if (endDate !== undefined) updateData.end_date = endDate;
    if (coverPhoto !== undefined) updateData.cover_photo = coverPhoto;
    if (budget !== undefined) updateData.budget = budget;
    if (status !== undefined) updateData.status = status;

    const { data, error } = await supabase
      .from('trips')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update trip error:', error);
      return res.status(500).json({
        message: 'Failed to update trip',
        code: 'DATABASE_ERROR'
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/trips/{id}:
 *   delete:
 *     summary: Delete a trip
 *     description: Delete a trip (user must be the owner)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     responses:
 *       200:
 *         description: Trip deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the trip owner
 *       404:
 *         description: Trip not found
 */
app.delete('/api/trips/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        message: 'Authorization token is required',
        code: 'MISSING_TOKEN'
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    const { id } = req.params;

    // Check if trip exists and user is owner
    const { data: existingTrip, error: fetchError } = await supabase
      .from('trips')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingTrip) {
      return res.status(404).json({
        message: 'Trip not found',
        code: 'NOT_FOUND'
      });
    }

    if (existingTrip.user_id !== user.id) {
      return res.status(403).json({
        message: 'You do not have permission to delete this trip',
        code: 'FORBIDDEN'
      });
    }

    // Delete trip (cascade will handle trip_destinations)
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete trip error:', error);
      return res.status(500).json({
        message: 'Failed to delete trip',
        code: 'DATABASE_ERROR'
      });
    }

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/trips/{id}/destinations:
 *   post:
 *     summary: Add destination to trip
 *     description: Add a destination to an existing trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - destinationId
 *             properties:
 *               destinationId:
 *                 type: string
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               visitOrder:
 *                 type: integer
 *                 example: 1
 *               notes:
 *                 type: string
 *                 example: "Visit the Eiffel Tower"
 *     responses:
 *       201:
 *         description: Destination added to trip
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Trip not found
 */
app.post('/api/trips/:id/destinations', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        message: 'Authorization token is required',
        code: 'MISSING_TOKEN'
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    const { id } = req.params;
    const { destinationId, visitOrder, notes } = req.body;

    if (!destinationId) {
      return res.status(400).json({
        message: 'Destination ID is required',
        code: 'MISSING_FIELDS'
      });
    }

    // Check if trip exists and user is owner
    const { data: existingTrip, error: fetchError } = await supabase
      .from('trips')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingTrip) {
      return res.status(404).json({
        message: 'Trip not found',
        code: 'NOT_FOUND'
      });
    }

    if (existingTrip.user_id !== user.id) {
      return res.status(403).json({
        message: 'You do not have permission to modify this trip',
        code: 'FORBIDDEN'
      });
    }

    // Add destination to trip
    const { data, error } = await supabase
      .from('trip_destinations')
      .insert({
        trip_id: id,
        destination_id: destinationId,
        visit_order: visitOrder,
        notes
      })
      .select()
      .single();

    if (error) {
      console.error('Add destination error:', error);
      return res.status(500).json({
        message: 'Failed to add destination to trip',
        code: 'DATABASE_ERROR'
      });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Add destination error:', error);
    res.status(500).json({
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve the authenticated user's profile information
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 */
app.get('/api/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        message: 'Authorization token is required',
        code: 'MISSING_TOKEN'
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    // Get user profile from database
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        message: 'Failed to fetch profile',
        code: 'DATABASE_ERROR'
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               avatarUrl:
 *                 type: string
 *                 example: https://example.com/avatar.jpg
 *               bio:
 *                 type: string
 *                 example: Travel enthusiast and photographer
 *               language:
 *                 type: string
 *                 example: en
 *               preferences:
 *                 type: object
 *                 example: {"theme": "dark", "notifications": true}
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
app.put('/api/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        message: 'Authorization token is required',
        code: 'MISSING_TOKEN'
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    const { fullName, avatarUrl, bio, language, preferences } = req.body;

    // Build update data
    const updateData = {};
    if (fullName !== undefined) updateData.full_name = fullName;
    if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;
    if (bio !== undefined) updateData.bio = bio;
    if (language !== undefined) updateData.language = language;
    if (preferences !== undefined) updateData.preferences = preferences;

    // Update profile
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({
        message: 'Failed to update profile',
        code: 'DATABASE_ERROR'
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/destinations/saved:
 *   get:
 *     summary: Get saved destinations
 *     description: Retrieve all destinations saved by the authenticated user
 *     tags: [Destinations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved destinations
 *       401:
 *         description: Unauthorized
 */
app.get('/api/destinations/saved', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        message: 'Authorization token is required',
        code: 'MISSING_TOKEN'
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    // Get saved destinations with full destination details
    const { data, error } = await supabase
      .from('saved_destinations')
      .select(`
        *,
        destinations (
          id,
          name,
          country,
          description,
          image,
          latitude,
          longitude
        )
      `)
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false });

    if (error) {
      console.error('Get saved destinations error:', error);
      return res.status(500).json({
        message: 'Failed to fetch saved destinations',
        code: 'DATABASE_ERROR'
      });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Get saved destinations error:', error);
    res.status(500).json({
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/destinations/{id}/save:
 *   post:
 *     summary: Save a destination
 *     description: Add a destination to the user's saved list
 *     tags: [Destinations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Destination ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 example: Want to visit during cherry blossom season
 *     responses:
 *       201:
 *         description: Destination saved successfully
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Destination already saved
 */
app.post('/api/destinations/:id/save', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        message: 'Authorization token is required',
        code: 'MISSING_TOKEN'
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    const { id } = req.params;
    const { notes } = req.body;

    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_destinations')
      .select('id')
      .eq('user_id', user.id)
      .eq('destination_id', id)
      .single();

    if (existing) {
      return res.status(409).json({
        message: 'Destination already saved',
        code: 'ALREADY_SAVED'
      });
    }

    // Save destination
    const { data, error } = await supabase
      .from('saved_destinations')
      .insert({
        user_id: user.id,
        destination_id: id,
        notes
      })
      .select()
      .single();

    if (error) {
      console.error('Save destination error:', error);
      return res.status(500).json({
        message: 'Failed to save destination',
        code: 'DATABASE_ERROR'
      });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Save destination error:', error);
    res.status(500).json({
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/destinations/{id}/save:
 *   delete:
 *     summary: Unsave a destination
 *     description: Remove a destination from the user's saved list
 *     tags: [Destinations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Destination ID
 *     responses:
 *       200:
 *         description: Destination unsaved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Saved destination not found
 */
app.delete('/api/destinations/:id/save', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        message: 'Authorization token is required',
        code: 'MISSING_TOKEN'
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    const { id } = req.params;

    // Delete saved destination
    const { error } = await supabase
      .from('saved_destinations')
      .delete()
      .eq('user_id', user.id)
      .eq('destination_id', id);

    if (error) {
      console.error('Unsave destination error:', error);
      return res.status(500).json({
        message: 'Failed to unsave destination',
        code: 'DATABASE_ERROR'
      });
    }

    res.json({ message: 'Destination unsaved successfully' });
  } catch (error) {
    console.error('Unsave destination error:', error);
    res.status(500).json({
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
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
