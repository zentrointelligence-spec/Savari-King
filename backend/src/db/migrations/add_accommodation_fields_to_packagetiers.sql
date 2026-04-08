-- ============================================================================
-- Migration: Add Accommodation Fields to PackageTiers
-- Description: Adds fields for accommodation details (name, image, description,
--              rating, tags) to make the Accommodation Highlights section dynamic
-- Author: Claude Code
-- Date: 2025-01-07
-- ============================================================================

-- Add accommodation fields to packagetiers table
ALTER TABLE packagetiers
ADD COLUMN IF NOT EXISTS accommodation_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS accommodation_image_url TEXT,
ADD COLUMN IF NOT EXISTS accommodation_description TEXT,
ADD COLUMN IF NOT EXISTS accommodation_rating DECIMAL(2,1) CHECK (accommodation_rating >= 1.0 AND accommodation_rating <= 5.0),
ADD COLUMN IF NOT EXISTS accommodation_tags TEXT[];

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_packagetiers_tour_id ON packagetiers(tour_id);

-- Add comments for documentation
COMMENT ON COLUMN packagetiers.accommodation_name IS 'Name of the specific hotel/resort for this package tier';
COMMENT ON COLUMN packagetiers.accommodation_image_url IS 'URL of the accommodation main image';
COMMENT ON COLUMN packagetiers.accommodation_description IS 'Detailed description of the accommodation';
COMMENT ON COLUMN packagetiers.accommodation_rating IS 'Static rating (1.0-5.0) based on official classification or admin evaluation';
COMMENT ON COLUMN packagetiers.accommodation_tags IS 'Array of feature tags (e.g., Pool, Spa, Beach Access)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Accommodation fields added successfully to packagetiers table!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'New fields:';
  RAISE NOTICE '  - accommodation_name: Name of the hotel/resort';
  RAISE NOTICE '  - accommodation_image_url: Main image URL';
  RAISE NOTICE '  - accommodation_description: Detailed description';
  RAISE NOTICE '  - accommodation_rating: Static rating (1.0-5.0)';
  RAISE NOTICE '  - accommodation_tags: Feature tags array';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Run the seed script to populate accommodation data';
  RAISE NOTICE '============================================================================';
END $$;
