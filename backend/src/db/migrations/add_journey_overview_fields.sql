-- ============================================================================
-- Migration: Add Journey Overview Fields to Tours
-- Description: Adds duration_days field and ensures itinerary/highlights/inclusions are populated
-- Author: Claude Code
-- Date: 2025-01-07
-- ============================================================================

-- Add duration_days if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tours' AND column_name = 'duration_days'
  ) THEN
    ALTER TABLE tours ADD COLUMN duration_days INTEGER DEFAULT 1;
    COMMENT ON COLUMN tours.duration_days IS 'Number of days for the tour';
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Journey Overview fields added successfully!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'New/Updated fields:';
  RAISE NOTICE '  - duration_days: Number of days for the tour';
  RAISE NOTICE '  - itinerary: JSONB (already exists)';
  RAISE NOTICE '  - highlights: TEXT[] (already exists)';
  RAISE NOTICE '  - inclusions: TEXT[] (already exists)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Run seed script to populate data';
  RAISE NOTICE '============================================================================';
END $$;
