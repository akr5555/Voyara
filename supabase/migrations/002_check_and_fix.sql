-- =====================================================
-- CHECK AND FIX MISSING TABLES/COLUMNS
-- =====================================================

-- Check if user_profiles exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
        CREATE TABLE user_profiles (
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

        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view their own profile" ON user_profiles
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own profile" ON user_profiles
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own profile" ON user_profiles
          FOR UPDATE USING (auth.uid() = user_id);

        RAISE NOTICE 'user_profiles table created';
    ELSE
        RAISE NOTICE 'user_profiles table already exists';
    END IF;
END $$;

-- Check if trips table exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'trips') THEN
        CREATE TABLE trips (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          cover_image_url TEXT,
          status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'upcoming', 'ongoing', 'completed', 'cancelled')),
          budget DECIMAL(10, 2),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          CONSTRAINT valid_dates CHECK (end_date >= start_date)
        );

        ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view their own trips" ON trips
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own trips" ON trips
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own trips" ON trips
          FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own trips" ON trips
          FOR DELETE USING (auth.uid() = user_id);

        RAISE NOTICE 'trips table created';
    ELSE
        RAISE NOTICE 'trips table already exists';
    END IF;
END $$;

-- Add missing column to trips if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'trips' 
        AND column_name = 'cover_image_url'
    ) THEN
        ALTER TABLE trips ADD COLUMN cover_image_url TEXT;
        RAISE NOTICE 'Added cover_image_url column to trips';
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_dates ON trips(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Create or replace the update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate triggers to avoid conflicts
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trips_updated_at ON trips;
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create auto-profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Show what tables exist now
SELECT 'Tables created:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'trips', 'destinations', 'trip_destinations', 'saved_destinations')
ORDER BY table_name;
