# Voyara API Server

This directory contains the Express.js backend server for the Voyara application with integrated Swagger UI documentation.

## Features

- ✅ Express.js REST API
- ✅ Swagger UI documentation at `/api-docs`
- ✅ CORS enabled
- ✅ Serves React frontend from `/dist` folder
- ✅ Sample API endpoints for destinations and trips

## Running Locally

### Development Mode

1. Start the Vite dev server (frontend):
```bash
npm run dev
```

2. In a separate terminal, start the API server:
```bash
npm run server
```

The server will run on `http://localhost:10000`

### Production Mode

Build and run the production server:
```bash
npm run build
npm start
```

## Accessing Swagger UI

### Local Development
- **Swagger UI**: http://localhost:10000/api-docs
- **API Base URL**: http://localhost:10000/api

### Production (Render)
After deployment to Render:
- **Swagger UI**: https://your-app-name.onrender.com/api-docs
- **API Base URL**: https://your-app-name.onrender.com/api

## Security Features

### ✅ Built-in Security (Same-Domain Deployment)

Serving both frontend and API from the same URL provides several security benefits:

1. **No CORS vulnerabilities** - Same-origin policy protection
2. **Unified SSL/TLS** - Single certificate for all traffic
3. **Cookie security** - HttpOnly and Secure cookies work seamlessly
4. **Hidden API endpoints** - API calls appear as relative paths
5. **Simplified authentication** - No cross-origin token issues

### 🔒 Security Middleware Implemented

- **Helmet.js** - Sets secure HTTP headers
  - X-Content-Type-Options
  - X-Frame-Options
  - X-XSS-Protection
  - Content-Security-Policy
  
- **Rate Limiting** - Prevents API abuse
  - 100 requests per 15 minutes per IP
  - Applied to all `/api/*` endpoints
  
- **Request Size Limits** - Prevents payload attacks
  - JSON/URL-encoded payloads limited to 10MB

### 🛡️ Best Practices

1. **Environment Variables**: Never commit sensitive data
2. **HTTPS Only**: Render provides free SSL certificates
3. **Input Validation**: Always validate user inputs
4. **Error Handling**: Don't expose sensitive error details
5. **Regular Updates**: Keep dependencies updated

## Available API Endpoints

### System
- `GET /api/health` - Health check endpoint

### Destinations
- `GET /api/destinations` - Get all destinations
- `GET /api/destinations/:id` - Get destination by ID

### Trips
- `GET /api/trips` - Get all upcoming trips
- `GET /api/trips/:id` - Get trip by ID

## Adding New Endpoints

To add a new API endpoint with Swagger documentation:

1. Add the route in `server/index.js`
2. Add JSDoc comments with Swagger annotations above the route
3. Define schemas in `server/swagger.js` if needed

Example:
```javascript
/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: List of bookings
 */
app.get('/api/bookings', (req, res) => {
  res.json({ bookings: [] });
});
```

## Deployment on Render

The `render.yaml` is already configured. When you push to your repository:

1. Render will automatically:
   - Install dependencies (`npm install`)
   - Build the React app (`npm run build`)
   - Start the server (`npm start`)

2. The server will:
   - Serve the API at `/api/*`
   - Serve Swagger UI at `/api-docs`
   - Serve the React app for all other routes

3. Access your Swagger UI at: `https://your-app-name.onrender.com/api-docs`

## Important Notes

- **Update the production URL** in `server/swagger.js` after deploying to Render
- The server listens on the `PORT` environment variable (Render provides this automatically)
- On Render's free tier, the app may sleep after 15 minutes of inactivity
- First request after sleeping may take 30-60 seconds to wake up

## Customization

### Swagger Theme
Modify the Swagger UI setup in `server/index.js`:
```javascript
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Your Custom Title'
}));
```

### API Schemas
Add or modify schemas in `server/swagger.js` under `components.schemas`

## Troubleshooting

### Swagger UI not loading
- Ensure `swagger-jsdoc` and `swagger-ui-express` are installed
- Check that the server is running on the correct port
- Verify the routes in `swagger.js` match your actual file paths

### API returning 404
- Check that the route is defined in `server/index.js`
- Ensure the route path matches what you're requesting
- Verify CORS is enabled if calling from a different origin

### Production deployment issues
- Check Render logs for errors
- Ensure `npm start` works locally
- Verify all environment variables are set in Render dashboard
