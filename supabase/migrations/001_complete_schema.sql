-- =====================================================
-- VOYARA DATABASE SCHEMA - COMPLETE SETUP
-- =====================================================
-- Run this in Supabase SQL Editor
-- Project: https://supabase.com/dashboard/project/yrlzcfuubkqdbkwlhjih

-- =====================================================
-- 1. DESTINATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS destinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

-- Policies for destinations
CREATE POLICY "Allow public read access to destinations" ON destinations
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert destinations" ON destinations
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update destinations" ON destinations
  FOR UPDATE TO authenticated USING (true);

-- =====================================================
-- 2. USER PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  language VARCHAR(10) DEFAULT 'en',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 3. TRIPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  cover_photo TEXT,
  status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'ongoing', 'completed', 'cancelled')),
  budget DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Enable RLS
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Policies for trips
CREATE POLICY "Users can view their own trips" ON trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trips" ON trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips" ON trips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips" ON trips
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 4. TRIP DESTINATIONS (Junction Table)
-- =====================================================
CREATE TABLE IF NOT EXISTS trip_destinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  arrival_date DATE,
  departure_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, destination_id)
);

-- Enable RLS
ALTER TABLE trip_destinations ENABLE ROW LEVEL SECURITY;

-- Policies for trip_destinations
CREATE POLICY "Users can view destinations in their trips" ON trip_destinations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = trip_destinations.trip_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add destinations to their trips" ON trip_destinations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = trip_destinations.trip_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update destinations in their trips" ON trip_destinations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = trip_destinations.trip_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete destinations from their trips" ON trip_destinations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = trip_destinations.trip_id AND trips.user_id = auth.uid()
    )
  );

-- =====================================================
-- 5. SAVED DESTINATIONS (Favorites/Wishlist)
-- =====================================================
CREATE TABLE IF NOT EXISTS saved_destinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  notes TEXT,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, destination_id)
);

-- Enable RLS
ALTER TABLE saved_destinations ENABLE ROW LEVEL SECURITY;

-- Policies for saved_destinations
CREATE POLICY "Users can view their saved destinations" ON saved_destinations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save destinations" ON saved_destinations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove saved destinations" ON saved_destinations
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_dates ON trips(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_trip_destinations_trip_id ON trip_destinations(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_destinations_destination_id ON trip_destinations(destination_id);
CREATE INDEX IF NOT EXISTS idx_saved_destinations_user_id ON saved_destinations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- =====================================================
-- 7. FUNCTIONS & TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON destinations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. INSERT SAMPLE DESTINATIONS DATA
-- =====================================================
INSERT INTO destinations (name, country, description, image, rating, latitude, longitude) VALUES
('Paris', 'France', 'The City of Light awaits with iconic landmarks, world-class museums, and romantic streets', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34', 4.8, 48.8566, 2.3522),
('Tokyo', 'Japan', 'Experience the perfect blend of ancient tradition and cutting-edge modernity', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf', 4.9, 35.6762, 139.6503),
('New York', 'USA', 'The city that never sleeps offers endless cultural attractions and vibrant energy', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9', 4.7, 40.7128, -74.0060),
('Barcelona', 'Spain', 'Gothic architecture meets Mediterranean beaches in this artistic coastal city', 'https://images.unsplash.com/photo-1583422409516-2895a77efded', 4.6, 41.3851, 2.1734),
('Dubai', 'UAE', 'Ultra-modern metropolis with luxury shopping, futuristic architecture, and desert adventures', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c', 4.5, 25.2048, 55.2708),
('Rome', 'Italy', 'Ancient ruins, Renaissance art, and authentic Italian cuisine in the Eternal City', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5', 4.8, 41.9028, 12.4964),
('London', 'UK', 'Historic landmarks, royal palaces, and multicultural neighborhoods define this global city', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad', 4.7, 51.5074, -0.1278),
('Bali', 'Indonesia', 'Tropical paradise with stunning beaches, lush rice terraces, and spiritual temples', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4', 4.8, -8.3405, 115.0920),
('Sydney', 'Australia', 'Iconic harbor city with world-famous opera house and pristine beaches', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9', 4.7, -33.8688, 151.2093),
('Santorini', 'Greece', 'Stunning island with whitewashed buildings, blue-domed churches, and breathtaking sunsets', 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e', 4.9, 36.3932, 25.4615)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 9. CREATE FUNCTION TO AUTO-CREATE USER PROFILE
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SETUP COMPLETE! 
-- =====================================================
-- Verify tables:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
