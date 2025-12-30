# 🗄️ Database Setup Guide for Voyara

## Current Status

✅ **Authentication**: Fully integrated with Supabase Auth  
⚠️ **Destinations & Trips**: Using mock data (database tables need to be created)

## Supabase Database Setup

To enable real data for destinations and trips, create the following tables in your Supabase dashboard:

### 1. Create `destinations` Table

```sql
-- Create destinations table
CREATE TABLE destinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON destinations
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated insert" ON destinations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to update
CREATE POLICY "Allow authenticated update" ON destinations
  FOR UPDATE
  TO authenticated
  USING (true);
```

### 2. Create `trips` Table

```sql
-- Create trips table
CREATE TABLE trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  available_seats INTEGER NOT NULL CHECK (available_seats >= 0),
  destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON trips
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated insert" ON trips
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to update
CREATE POLICY "Allow authenticated update" ON trips
  FOR UPDATE
  TO authenticated
  USING (true);
```

### 3. Insert Sample Data

```sql
-- Insert sample destinations
INSERT INTO destinations (name, country, description, image, rating) VALUES
('Paris', 'France', 'The City of Light awaits with iconic landmarks and rich culture', '/placeholder.svg', 4.8),
('Tokyo', 'Japan', 'Experience the perfect blend of tradition and modernity', '/placeholder.svg', 4.9),
('New York', 'USA', 'The city that never sleeps offers endless possibilities', '/placeholder.svg', 4.7),
('Barcelona', 'Spain', 'Gothic architecture meets Mediterranean beaches', '/placeholder.svg', 4.6),
('Dubai', 'UAE', 'Ultra-modern city with luxury shopping and nightlife', '/placeholder.svg', 4.5);

-- Insert sample trips (using destination IDs from above)
INSERT INTO trips (title, destination, start_date, end_date, price, available_seats) VALUES
('Paris Adventure', 'Paris, France', '2025-03-15', '2025-03-22', 1299.00, 12),
('Tokyo Explorer', 'Tokyo, Japan', '2025-04-10', '2025-04-20', 2499.00, 8),
('New York City Break', 'New York, USA', '2025-05-05', '2025-05-12', 1899.00, 15),
('Barcelona Getaway', 'Barcelona, Spain', '2025-06-01', '2025-06-08', 1499.00, 10),
('Dubai Luxury Tour', 'Dubai, UAE', '2025-07-15', '2025-07-22', 3299.00, 6);
```

## How to Apply These Changes

### Option 1: Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/yrlzcfuubkqdbkwlhjih)
2. Click on **SQL Editor** in the left sidebar
3. Click **+ New Query**
4. Copy and paste the SQL commands above
5. Click **Run** or press `Ctrl+Enter`

### Option 2: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref yrlzcfuubkqdbkwlhjih

# Run migrations
supabase db reset
```

## After Database Setup

Once the tables are created, update the server code to use real data:

### In `server/index.js`

**Replace this:**
```javascript
// Currently returning mock data
const destinations = [ /* mock data */ ];
res.json(destinations);
```

**With this:**
```javascript
const { data, error } = await supabase.from('destinations').select('*');
if (error) throw error;
res.json(data);
```

## Environment Variables

Make sure these are set in Render:

```
VITE_SUPABASE_URL=https://yrlzcfuubkqdbkwlhjih.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=yrlzcfuubkqdbkwlhjih
```

## API Endpoints Status

| Endpoint | Status | Database Required |
|----------|--------|-------------------|
| `POST /api/auth/signup` | ✅ Working | No (uses Supabase Auth) |
| `POST /api/auth/login` | ✅ Working | No (uses Supabase Auth) |
| `POST /api/auth/logout` | ✅ Working | No (uses Supabase Auth) |
| `GET /api/auth/me` | ✅ Working | No (uses Supabase Auth) |
| `GET /api/destinations` | ⚠️ Mock Data | Yes (needs `destinations` table) |
| `GET /api/destinations/:id` | ⚠️ Mock Data | Yes (needs `destinations` table) |
| `GET /api/trips` | ⚠️ Mock Data | Yes (needs `trips` table) |
| `GET /api/trips/:id` | ⚠️ Mock Data | Yes (needs `trips` table) |

## Testing

After setting up the database:

1. Visit: https://voyara.onrender.com/api-docs
2. Test authentication endpoints with real credentials
3. Test destinations/trips endpoints to see real data
4. All endpoints will now validate against actual database records

## Security Notes

- ✅ Row Level Security (RLS) is enabled
- ✅ Public can read destinations and trips
- ✅ Only authenticated users can create/update
- ✅ JWT tokens are validated for protected routes
- ✅ Passwords are hashed by Supabase Auth
