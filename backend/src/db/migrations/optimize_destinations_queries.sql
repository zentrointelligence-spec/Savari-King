-- ======================================================================
-- FILE: optimize_destinations_queries.sql
-- Purpose: Optimize destination queries with materialized views and functions
-- ======================================================================

-- 1. Create materialized view for popular destinations (faster queries)
-- This view pre-calculates popularity scores and seasonal information

DROP MATERIALIZED VIEW IF EXISTS mv_popular_destinations CASCADE;

CREATE MATERIALIZED VIEW mv_popular_destinations AS
SELECT
  d.*,
  -- Popularity score calculation
  (
    (d.tour_count * 0.25) +
    (d.avg_rating * 5 * 0.20) +
    (d.total_bookings * 0.30) +
    (d.wishlist_count * 0.10) +
    (CASE WHEN d.is_featured THEN 10 ELSE 0 END) +
    (CASE WHEN d.is_trending THEN 5 ELSE 0 END)
  ) as popularity_score,

  -- Current ideal season (if marked as ideal)
  (
    SELECT ds.season
    FROM destination_seasons ds
    WHERE ds.destination_id = d.id
      AND ds.is_ideal = true
    LIMIT 1
  ) as current_season,

  (
    SELECT ds.description
    FROM destination_seasons ds
    WHERE ds.destination_id = d.id
      AND ds.is_ideal = true
    LIMIT 1
  ) as current_season_description,

  -- Upcoming festivals (next 3 months)
  (
    SELECT jsonb_agg(festival ORDER BY (festival->>'date')::date)
    FROM jsonb_array_elements(d.festivals_events) festival
    WHERE (festival->>'date')::date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 months'
  ) as upcoming_festivals,

  -- Categories aggregated
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', dc.id,
        'name', dc.name,
        'icon', dc.icon,
        'color', dc.color
      )
    )
    FROM destination_category_assignments dca
    JOIN destination_categories dc ON dca.category_id = dc.id
    WHERE dca.destination_id = d.id
  ) as categories

FROM destinations d
WHERE d.is_active = true;

-- Create indexes on the materialized view for faster queries
CREATE INDEX idx_mv_popular_dest_score ON mv_popular_destinations(popularity_score DESC);
CREATE INDEX idx_mv_popular_dest_featured ON mv_popular_destinations(is_featured, popularity_score DESC) WHERE is_featured = true;
CREATE INDEX idx_mv_popular_dest_trending ON mv_popular_destinations(is_trending, popularity_score DESC) WHERE is_trending = true;
CREATE INDEX idx_mv_popular_dest_region ON mv_popular_destinations(region);
CREATE INDEX idx_mv_popular_dest_budget ON mv_popular_destinations(budget_category);
CREATE INDEX idx_mv_popular_dest_adventure ON mv_popular_destinations(adventure_level);
CREATE INDEX idx_mv_popular_dest_rating ON mv_popular_destinations(avg_rating DESC);
CREATE UNIQUE INDEX idx_mv_popular_dest_id ON mv_popular_destinations(id);

-- 2. Function to refresh the materialized view
-- This should be called periodically (hourly or when data changes significantly)

CREATE OR REPLACE FUNCTION refresh_popular_destinations()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_popular_destinations;
END;
$$ LANGUAGE plpgsql;

-- 3. Function to calculate destination popularity score dynamically
-- Useful for real-time calculations without hitting the materialized view

CREATE OR REPLACE FUNCTION calculate_destination_popularity_score(dest_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
  score NUMERIC;
BEGIN
  SELECT
    (
      (d.tour_count * 0.25) +
      (d.avg_rating * 5 * 0.20) +
      (d.total_bookings * 0.30) +
      (d.wishlist_count * 0.10) +
      (CASE WHEN d.is_featured THEN 10 ELSE 0 END) +
      (CASE WHEN d.is_trending THEN 5 ELSE 0 END)
    )
  INTO score
  FROM destinations d
  WHERE d.id = dest_id;

  RETURN COALESCE(score, 0);
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger to auto-refresh materialized view when important stats change
-- Instead of refreshing the entire view, we'll send a notification for a background job

CREATE OR REPLACE FUNCTION notify_destination_stats_updated()
RETURNS TRIGGER AS $$
BEGIN
  -- Send notification for background refresh job
  PERFORM pg_notify('refresh_destinations_mv', json_build_object(
    'destination_id', NEW.id,
    'action', TG_OP,
    'timestamp', NOW()
  )::text);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on destinations table
DROP TRIGGER IF EXISTS trg_destination_stats_updated ON destinations;

CREATE TRIGGER trg_destination_stats_updated
AFTER UPDATE OF tour_count, avg_rating, total_bookings, wishlist_count, is_featured, is_trending
ON destinations
FOR EACH ROW
EXECUTE FUNCTION notify_destination_stats_updated();

-- 5. Function to get current season for a destination
DROP FUNCTION IF EXISTS get_destination_current_season(INTEGER);

CREATE OR REPLACE FUNCTION get_destination_current_season(dest_id INTEGER)
RETURNS TABLE(season VARCHAR, description TEXT, is_ideal BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ds.season,
    ds.description,
    ds.is_ideal
  FROM destination_seasons ds
  WHERE ds.destination_id = dest_id
    AND ds.is_ideal = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 6. Function to get upcoming festivals for a destination
CREATE OR REPLACE FUNCTION get_destination_upcoming_festivals(dest_id INTEGER, months_ahead INTEGER DEFAULT 3)
RETURNS JSONB AS $$
DECLARE
  festivals JSONB;
BEGIN
  SELECT jsonb_agg(festival ORDER BY (festival->>'date')::date)
  INTO festivals
  FROM (
    SELECT jsonb_array_elements(d.festivals_events) as festival
    FROM destinations d
    WHERE d.id = dest_id
  ) sub
  WHERE (festival->>'date')::date BETWEEN CURRENT_DATE AND CURRENT_DATE + (months_ahead || ' months')::INTERVAL;

  RETURN COALESCE(festivals, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- 7. Enhance destination_seasons table structure (add month ranges for better filtering)
-- This adds month_start and month_end columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'destination_seasons' AND column_name = 'month_start'
  ) THEN
    ALTER TABLE destination_seasons
    ADD COLUMN month_start INTEGER,
    ADD COLUMN month_end INTEGER;

    -- Add check constraint
    ALTER TABLE destination_seasons
    ADD CONSTRAINT chk_month_range CHECK (
      (month_start IS NULL AND month_end IS NULL) OR
      (month_start BETWEEN 1 AND 12 AND month_end BETWEEN 1 AND 12)
    );
  END IF;
END$$;

-- 8. Add constraint to ensure destination_likes is unique per user-destination pair
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'destination_likes_user_dest_unique'
  ) THEN
    ALTER TABLE destination_likes
    ADD CONSTRAINT destination_likes_user_dest_unique
    UNIQUE (user_id, destination_id);
  END IF;
END$$;

-- 9. Create index on destination_likes for faster lookups
CREATE INDEX IF NOT EXISTS idx_destination_likes_user ON destination_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_destination_likes_dest ON destination_likes(destination_id);
CREATE INDEX IF NOT EXISTS idx_destination_likes_created ON destination_likes(created_at DESC);

-- 10. Initial refresh of the materialized view
SELECT refresh_popular_destinations();

-- 11. Grant necessary permissions
GRANT SELECT ON mv_popular_destinations TO PUBLIC;

-- ======================================================================
-- VERIFICATION QUERIES (for testing)
-- ======================================================================

-- Test query 1: Get top 10 destinations by popularity
-- SELECT id, name, popularity_score, current_season
-- FROM mv_popular_destinations
-- ORDER BY popularity_score DESC
-- LIMIT 10;

-- Test query 2: Get featured destinations
-- SELECT id, name, popularity_score, is_featured
-- FROM mv_popular_destinations
-- WHERE is_featured = true
-- ORDER BY popularity_score DESC
-- LIMIT 5;

-- Test query 3: Get trending destinations
-- SELECT id, name, popularity_score, is_trending
-- FROM mv_popular_destinations
-- WHERE is_trending = true
-- ORDER BY popularity_score DESC;

-- Test query 4: Check current season for a destination
-- SELECT * FROM get_destination_current_season(127); -- Kerala

-- Test query 5: Check upcoming festivals
-- SELECT get_destination_upcoming_festivals(127, 6);

-- ======================================================================
-- MAINTENANCE NOTES
-- ======================================================================
-- The materialized view should be refreshed:
-- 1. Hourly via a cron job or scheduled task
-- 2. When significant data changes occur (via pg_notify)
-- 3. Manually when needed: SELECT refresh_popular_destinations();
--
-- To check last refresh time:
-- SELECT schemaname, matviewname, last_refresh
-- FROM pg_matviews
-- WHERE matviewname = 'mv_popular_destinations';
-- ======================================================================
