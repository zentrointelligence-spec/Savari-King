-- ================================================================
-- Performance Indexes Migration - Phase 5
-- Adds indexes to optimize common queries for the Destinations Module
-- ================================================================

-- Execution: psql -U postgres -d ebookingsam -f add_performance_indexes.sql

BEGIN;

-- ================================================================
-- 1. DESTINATIONS TABLE INDEXES
-- ================================================================

-- Index for slug lookups (used in DestinationDetailPage)
CREATE INDEX IF NOT EXISTS idx_destinations_slug
ON destinations(slug)
WHERE is_active = true;

-- Index for active destinations with popularity
CREATE INDEX IF NOT EXISTS idx_destinations_active_popular
ON destinations(is_active, popularity_score DESC NULLS LAST)
WHERE is_active = true;

-- Index for featured destinations
CREATE INDEX IF NOT EXISTS idx_destinations_featured
ON destinations(is_featured, popularity_score DESC)
WHERE is_active = true AND is_featured = true;

-- Index for region-based queries
CREATE INDEX IF NOT EXISTS idx_destinations_region_active
ON destinations(region, is_active);

-- Index for budget category filtering
CREATE INDEX IF NOT EXISTS idx_destinations_budget
ON destinations(budget_category, is_active)
WHERE is_active = true;

-- Index for rating-based sorting
CREATE INDEX IF NOT EXISTS idx_destinations_rating
ON destinations(avg_rating DESC NULLS LAST, is_active)
WHERE is_active = true;

-- Composite index for location-based queries (nearby destinations)
CREATE INDEX IF NOT EXISTS idx_destinations_location
ON destinations(latitude, longitude)
WHERE is_active = true AND latitude IS NOT NULL AND longitude IS NOT NULL;

-- GiST index for full-text search on name and description
CREATE INDEX IF NOT EXISTS idx_destinations_fulltext
ON destinations
USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Index for flags (UNESCO, Wildlife, etc.)
CREATE INDEX IF NOT EXISTS idx_destinations_flags
ON destinations(is_unesco, is_wildlife_sanctuary, eco_friendly, is_active)
WHERE is_active = true;

-- ================================================================
-- 2. TOURS TABLE INDEXES (for destination relationships)
-- ================================================================

-- Index for tours by destination (used in getDestinationTours)
CREATE INDEX IF NOT EXISTS idx_tours_destination
ON tours(destination_id, is_active)
WHERE is_active = true;

-- Index for tour availability
CREATE INDEX IF NOT EXISTS idx_tours_active_rating
ON tours(is_active, avg_rating DESC NULLS LAST)
WHERE is_active = true;

-- ================================================================
-- 3. REVIEWS TABLE INDEXES
-- ================================================================

-- Index for destination reviews (used in stats calculation)
CREATE INDEX IF NOT EXISTS idx_reviews_destination
ON reviews(destination_id, rating, is_approved)
WHERE is_approved = true;

-- Index for review counts
CREATE INDEX IF NOT EXISTS idx_reviews_destination_count
ON reviews(destination_id, created_at DESC)
WHERE is_approved = true;

-- ================================================================
-- 4. BOOKINGS TABLE INDEXES
-- ================================================================

-- Index for destination bookings (used in stats)
CREATE INDEX IF NOT EXISTS idx_bookings_tour_status
ON bookings(tour_id, status)
WHERE status IN ('confirmed', 'completed');

-- Index for user bookings (used in recommendations)
CREATE INDEX IF NOT EXISTS idx_bookings_user_status
ON bookings(user_id, status, created_at DESC)
WHERE status NOT IN ('cancelled', 'failed');

-- ================================================================
-- 5. DESTINATION_LIKES TABLE (if it exists or will be created)
-- ================================================================

-- Create table if doesn't exist
CREATE TABLE IF NOT EXISTS destination_likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, destination_id)
);

-- Index for user's liked destinations
CREATE INDEX IF NOT EXISTS idx_destination_likes_user
ON destination_likes(user_id, created_at DESC);

-- Index for destination like counts
CREATE INDEX IF NOT EXISTS idx_destination_likes_destination
ON destination_likes(destination_id);

-- ================================================================
-- 6. MATERIALIZED VIEW INDEXES (from Phase 1)
-- ================================================================

-- Ensure materialized view has proper indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_popular_destinations_id
ON mv_popular_destinations(id);

CREATE INDEX IF NOT EXISTS idx_mv_popular_destinations_score
ON mv_popular_destinations(popularity_score DESC);

CREATE INDEX IF NOT EXISTS idx_mv_popular_destinations_featured
ON mv_popular_destinations(is_featured, popularity_score DESC);

-- ================================================================
-- 7. JSONB INDEXES (for festival and weather data)
-- ================================================================

-- GIN index for festivals_events JSONB searches
CREATE INDEX IF NOT EXISTS idx_destinations_festivals
ON destinations USING gin(festivals_events);

-- GIN index for weather_data JSONB searches
CREATE INDEX IF NOT EXISTS idx_destinations_weather
ON destinations USING gin(weather_data);

-- GIN index for activities array searches
CREATE INDEX IF NOT EXISTS idx_destinations_activities
ON destinations USING gin(activities);

-- ================================================================
-- 8. PARTIAL INDEXES for Common Filters
-- ================================================================

-- Index for current season destinations
CREATE INDEX IF NOT EXISTS idx_destinations_current_season
ON destinations(id, best_time_to_visit)
WHERE is_active = true AND best_time_to_visit IS NOT NULL;

-- Index for destinations with upcoming festivals
CREATE INDEX IF NOT EXISTS idx_destinations_with_festivals
ON destinations(id)
WHERE is_active = true AND festivals_events IS NOT NULL
  AND jsonb_array_length(festivals_events) > 0;

-- Index for destinations with coordinates (for map display)
CREATE INDEX IF NOT EXISTS idx_destinations_with_coordinates
ON destinations(id, latitude, longitude, name)
WHERE is_active = true AND latitude IS NOT NULL AND longitude IS NOT NULL;

-- ================================================================
-- 9. COVERING INDEXES (include commonly selected columns)
-- ================================================================

-- Covering index for destination list queries
CREATE INDEX IF NOT EXISTS idx_destinations_list_covering
ON destinations(is_active, popularity_score DESC)
INCLUDE (id, name, slug, region, avg_rating, tour_count)
WHERE is_active = true;

-- ================================================================
-- 10. ANALYZE TABLES for Query Planner
-- ================================================================

-- Update statistics for query planner
ANALYZE destinations;
ANALYZE tours;
ANALYZE reviews;
ANALYZE bookings;
ANALYZE destination_likes;
ANALYZE mv_popular_destinations;

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Check index usage (uncomment to run)
/*
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('destinations', 'tours', 'reviews', 'bookings')
ORDER BY idx_scan DESC;
*/

-- Check table statistics
/*
SELECT
  schemaname,
  tablename,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND tablename IN ('destinations', 'tours', 'reviews', 'bookings')
ORDER BY n_live_tup DESC;
*/

COMMIT;

-- ================================================================
-- MAINTENANCE RECOMMENDATIONS
-- ================================================================

-- Run VACUUM ANALYZE periodically to maintain index performance
-- Schedule this via cron or pg_cron:
-- VACUUM ANALYZE destinations;
-- VACUUM ANALYZE tours;
-- VACUUM ANALYZE reviews;
-- VACUUM ANALYZE bookings;

-- Refresh materialized view daily (already have function from Phase 1)
-- SELECT refresh_popular_destinations();

-- Monitor slow queries:
-- SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;

COMMENT ON INDEX idx_destinations_slug IS 'Optimizes destination detail page lookups by slug';
COMMENT ON INDEX idx_destinations_fulltext IS 'Enables full-text search on destination names and descriptions';
COMMENT ON INDEX idx_destinations_location IS 'Optimizes nearby destination queries using lat/long';
COMMENT ON INDEX idx_destinations_festivals IS 'Optimizes JSONB queries on festival data';

SELECT 'Performance indexes created successfully!' as status;
