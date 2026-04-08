-- ================================================================
-- Additional Performance Indexes - Phase 5
-- Adds only missing indexes that don't already exist
-- ================================================================

BEGIN;

-- Index for JSONB festival searches (if not exists)
CREATE INDEX IF NOT EXISTS idx_destinations_festivals_jsonb
ON destinations USING gin(festivals_events)
WHERE festivals_events IS NOT NULL AND festivals_events != '[]'::jsonb;

-- Index for JSONB weather searches
CREATE INDEX IF NOT EXISTS idx_destinations_weather_jsonb
ON destinations USING gin(weather_data)
WHERE weather_data IS NOT NULL AND weather_data != '{}'::jsonb;

-- Composite index for featured destinations with better sorting
CREATE INDEX IF NOT EXISTS idx_destinations_featured_composite
ON destinations(is_featured, avg_rating DESC, tour_count DESC)
WHERE is_active = true AND is_featured = true;

-- Index for destinations with coordinates (map display)
CREATE INDEX IF NOT EXISTS idx_destinations_map_display
ON destinations(id, name, latitude, longitude, slug)
WHERE is_active = true AND latitude IS NOT NULL AND longitude IS NOT NULL;

-- Index for active destinations by region
CREATE INDEX IF NOT EXISTS idx_destinations_active_region
ON destinations(region, avg_rating DESC)
WHERE is_active = true AND region IS NOT NULL;

-- Covering index for destination lists
CREATE INDEX IF NOT EXISTS idx_destinations_list_performance
ON destinations(is_active, avg_rating DESC, tour_count DESC)
INCLUDE (id, name, slug, short_description, thumbnail_image)
WHERE is_active = true;

-- Index for UNESCO/Heritage/Wildlife filtering
CREATE INDEX IF NOT EXISTS idx_destinations_special_flags
ON destinations(unesco_site, heritage_site, wildlife_sanctuary, is_active)
WHERE is_active = true AND (unesco_site = true OR heritage_site = true OR wildlife_sanctuary = true);

-- Update statistics
ANALYZE destinations;
ANALYZE tours;
ANALYZE reviews;
ANALYZE bookings;

SELECT 'Additional performance indexes created successfully!' as status;

COMMIT;
