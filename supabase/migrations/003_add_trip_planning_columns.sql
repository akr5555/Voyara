-- =====================================================
-- ADD TRIP PLANNING COLUMNS
-- =====================================================
-- Add missing columns needed for trip planning functionality

-- Add destination column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'trips' 
        AND column_name = 'destination'
    ) THEN
        ALTER TABLE trips ADD COLUMN destination TEXT;
        RAISE NOTICE 'Added destination column to trips';
    END IF;
END $$;

-- Add adults column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'trips' 
        AND column_name = 'adults'
    ) THEN
        ALTER TABLE trips ADD COLUMN adults INTEGER DEFAULT 0;
        RAISE NOTICE 'Added adults column to trips';
    END IF;
END $$;

-- Add kids column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'trips' 
        AND column_name = 'kids'
    ) THEN
        ALTER TABLE trips ADD COLUMN kids INTEGER DEFAULT 0;
        RAISE NOTICE 'Added kids column to trips';
    END IF;
END $$;

-- Add preferences column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'trips' 
        AND column_name = 'preferences'
    ) THEN
        ALTER TABLE trips ADD COLUMN preferences TEXT[] DEFAULT ARRAY[]::TEXT[];
        RAISE NOTICE 'Added preferences column to trips';
    END IF;
END $$;

-- Show updated trips table structure
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'trips'
ORDER BY ordinal_position;
