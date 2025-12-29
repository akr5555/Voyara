# Voyara API with Swagger Documentation

## 🚀 Quick Start

### 1. Test Locally

```bash
# Start the API server
npm run server
```

Then open your browser and go to:
- **Swagger UI**: http://localhost:3000/api-docs
- **API Root**: http://localhost:3000

### 2. Deploy to Render

#### Option A: Separate API Service (Recommended)

1. **Create a new Web Service on Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repo

2. **Configure the service:**
   - **Name**: `voyara-api`
   - **Runtime**: `Node`
   - **Root Directory**: `visual-showcase-builder`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run server`

3. **Add Environment Variables** (if needed):
   - `PORT`: 10000 (Render auto-sets this)
   - Any database or API keys your backend needs

4. **Deploy!**
   - Click "Create Web Service"
   - Wait for deployment
   - Your Swagger UI will be at: `https://voyara-api.onrender.com/api-docs`

#### Option B: Update Existing Service

If you want to run both frontend and API on the same service:

1. Update `render.yaml`:
```yaml
services:
  - type: web
    name: voyara-api
    runtime: node
    buildCommand: npm install
    startCommand: npm run server
```

2. Push to GitHub and Render will redeploy

## 📚 API Documentation

Once deployed, your Swagger UI will be available at:
- **Local**: http://localhost:3000/api-docs
- **Production**: https://voyara-api.onrender.com/api-docs

## 🛠️ Available Endpoints

### Health Check
- `GET /api/health` - Check API status

### Trips
- `GET /api/trips` - Get all trips
- `GET /api/trips/:id` - Get trip by ID
- `POST /api/trips` - Create new trip (requires auth)

## 📝 Adding New Endpoints

To add new endpoints with Swagger documentation:

```javascript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     summary: Description of endpoint
 *     tags: [YourTag]
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/api/your-endpoint', (req, res) => {
  res.json({ message: 'Your response' });
});
```

## 🔐 Authentication

The API uses Bearer Token authentication. To test authenticated endpoints in Swagger:

1. Click the "Authorize" button in Swagger UI
2. Enter your JWT token
3. Click "Authorize"
4. Now you can test protected endpoints

## ⚠️ Important Notes

- **Free Tier**: On Render's free tier, the API will spin down after 15 minutes of inactivity
- **First Request**: May take 30-60 seconds to wake up
- **CORS**: Already configured to allow requests from your frontend

## 📦 Dependencies

- `express` - Web framework
- `swagger-ui-express` - Swagger UI middleware
- `swagger-jsdoc` - Generate Swagger from JSDoc comments
- `cors` - Enable CORS

## 🎯 Next Steps

1. Test the API locally
2. Deploy to Render
3. Update your frontend to use the API endpoints
4. Share the Swagger URL with your team
