-- ============================================================
-- Migration: Adapt Vehicle Pricing Structure
-- Date: 2025-10-11
-- Description:
--   Rename price_per_day to base_price_inr to match tour pricing system
--   This enables dynamic currency conversion using the same system as tours
-- ============================================================

-- Step 1: Rename the column
ALTER TABLE vehicles
  RENAME COLUMN price_per_day TO base_price_inr;

-- Step 2: Update the column comment for clarity
COMMENT ON COLUMN vehicles.base_price_inr IS 'Base price per day in Indian Rupees (INR). This will be dynamically converted to user''s selected currency on the frontend.';

-- ============================================================
-- Verification Query
-- ============================================================

-- Verify the column has been renamed and check current prices
-- SELECT id, name, base_price_inr, capacity FROM vehicles ORDER BY id;

-- Check column exists in table structure
-- \d vehicles

-- ============================================================
-- Rollback (if needed)
-- ============================================================

-- To rollback this migration:
-- ALTER TABLE vehicles RENAME COLUMN base_price_inr TO price_per_day;
-- COMMENT ON COLUMN vehicles.price_per_day IS NULL;
