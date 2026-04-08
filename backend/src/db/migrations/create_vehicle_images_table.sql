-- ============================================================
-- Migration: Create Vehicle Images Table
-- Date: 2025-10-11
-- Description:
--   1. Create vehicle_images table to store multiple images per vehicle
--   2. Add display_order for controlling image sequence
--   3. Support for up to 4 images per vehicle for carousel display
-- ============================================================

-- Step 1: Create vehicle_images table
CREATE TABLE IF NOT EXISTS vehicle_images (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_display_order ON vehicle_images(vehicle_id, display_order);

-- Step 3: Add unique constraint to prevent duplicate display orders per vehicle
ALTER TABLE vehicle_images
  ADD CONSTRAINT unique_vehicle_display_order UNIQUE (vehicle_id, display_order);

-- Step 4: Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vehicle_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vehicle_images_updated_at
  BEFORE UPDATE ON vehicle_images
  FOR EACH ROW
  EXECUTE FUNCTION update_vehicle_images_updated_at();

-- ============================================================
-- Verification Queries (Run these to verify the migration)
-- ============================================================

-- Check vehicle_images table structure
-- \d vehicle_images

-- Count images per vehicle
-- SELECT v.name, COUNT(vi.id) as image_count
-- FROM vehicles v
-- LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
-- GROUP BY v.id, v.name
-- ORDER BY image_count DESC;

-- ============================================================
-- Rollback (if needed)
-- ============================================================

-- To rollback this migration:
-- DROP TRIGGER IF EXISTS trigger_update_vehicle_images_updated_at ON vehicle_images;
-- DROP FUNCTION IF EXISTS update_vehicle_images_updated_at();
-- DROP TABLE IF EXISTS vehicle_images;
