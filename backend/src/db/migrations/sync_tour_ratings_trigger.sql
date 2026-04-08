-- ============================================================================
-- Migration: Automatic Tour Rating Synchronization
-- Description: Creates triggers to automatically update tours.avg_rating and
--              tours.review_count when reviews are added, updated, or deleted
-- Author: Claude Code
-- Date: 2025-01-07
-- ============================================================================

-- Function to update tour rating statistics
-- This function calculates the average rating and count from approved reviews
CREATE OR REPLACE FUNCTION sync_tour_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_tour_id INTEGER;
BEGIN
  -- Determine which tour_id to update based on the operation
  IF (TG_OP = 'DELETE') THEN
    target_tour_id := OLD.tour_id;
  ELSE
    target_tour_id := NEW.tour_id;
  END IF;

  -- Update the tour's avg_rating and review_count
  -- Only count reviews that are approved
  UPDATE tours
  SET
    avg_rating = COALESCE(
      (SELECT ROUND(AVG(rating)::numeric, 2)
       FROM reviews
       WHERE tour_id = target_tour_id AND is_approved = true),
      0
    ),
    review_count = COALESCE(
      (SELECT COUNT(*)
       FROM reviews
       WHERE tour_id = target_tour_id AND is_approved = true),
      0
    ),
    rating = COALESCE(
      (SELECT ROUND(AVG(rating)::numeric, 2)
       FROM reviews
       WHERE tour_id = target_tour_id AND is_approved = true),
      0
    )
  WHERE id = target_tour_id;

  -- Return the appropriate row
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist (to allow re-running this migration)
DROP TRIGGER IF EXISTS trigger_sync_tour_rating_on_insert ON reviews;
DROP TRIGGER IF EXISTS trigger_sync_tour_rating_on_update ON reviews;
DROP TRIGGER IF EXISTS trigger_sync_tour_rating_on_delete ON reviews;

-- Trigger: After INSERT - sync rating when a new review is added
CREATE TRIGGER trigger_sync_tour_rating_on_insert
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION sync_tour_rating_stats();

-- Trigger: After UPDATE - sync rating when a review is modified
-- This is important when reviews are approved/rejected or rating is changed
CREATE TRIGGER trigger_sync_tour_rating_on_update
AFTER UPDATE ON reviews
FOR EACH ROW
WHEN (
  OLD.rating IS DISTINCT FROM NEW.rating OR
  OLD.is_approved IS DISTINCT FROM NEW.is_approved OR
  OLD.tour_id IS DISTINCT FROM NEW.tour_id
)
EXECUTE FUNCTION sync_tour_rating_stats();

-- Trigger: After DELETE - sync rating when a review is deleted
CREATE TRIGGER trigger_sync_tour_rating_on_delete
AFTER DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION sync_tour_rating_stats();

-- ============================================================================
-- Initial sync: Update all existing tours with current review statistics
-- ============================================================================

DO $$
DECLARE
  tour_record RECORD;
  updated_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting initial sync of tour ratings...';

  -- Update all tours with their current review statistics
  FOR tour_record IN
    SELECT DISTINCT tour_id FROM reviews
  LOOP
    UPDATE tours
    SET
      avg_rating = COALESCE(
        (SELECT ROUND(AVG(rating)::numeric, 2)
         FROM reviews
         WHERE tour_id = tour_record.tour_id AND is_approved = true),
        0
      ),
      review_count = COALESCE(
        (SELECT COUNT(*)
         FROM reviews
         WHERE tour_id = tour_record.tour_id AND is_approved = true),
        0
      ),
      rating = COALESCE(
        (SELECT ROUND(AVG(rating)::numeric, 2)
         FROM reviews
         WHERE tour_id = tour_record.tour_id AND is_approved = true),
        0
      )
    WHERE id = tour_record.tour_id;

    updated_count := updated_count + 1;
  END LOOP;

  RAISE NOTICE 'Initial sync completed. Updated % tours.', updated_count;
END $$;

-- ============================================================================
-- Verification Query (optional - for testing)
-- ============================================================================

-- Uncomment to verify the sync is working:
-- SELECT
--   t.id,
--   t.name,
--   t.avg_rating as stored_rating,
--   t.review_count as stored_count,
--   ROUND(AVG(r.rating)::numeric, 2) as calculated_rating,
--   COUNT(r.id) as calculated_count
-- FROM tours t
-- LEFT JOIN reviews r ON t.id = r.tour_id AND r.is_approved = true
-- GROUP BY t.id, t.name, t.avg_rating, t.review_count
-- HAVING
--   t.avg_rating IS DISTINCT FROM ROUND(AVG(r.rating)::numeric, 2) OR
--   t.review_count IS DISTINCT FROM COUNT(r.id)
-- ORDER BY t.id;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Tour Rating Synchronization Triggers Created Successfully!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Triggers created:';
  RAISE NOTICE '  - trigger_sync_tour_rating_on_insert';
  RAISE NOTICE '  - trigger_sync_tour_rating_on_update';
  RAISE NOTICE '  - trigger_sync_tour_rating_on_delete';
  RAISE NOTICE '';
  RAISE NOTICE 'How it works:';
  RAISE NOTICE '  - When a review is ADDED → tour rating updates automatically';
  RAISE NOTICE '  - When a review is UPDATED → tour rating recalculates';
  RAISE NOTICE '  - When a review is DELETED → tour rating adjusts';
  RAISE NOTICE '  - Only APPROVED reviews are counted';
  RAISE NOTICE '';
  RAISE NOTICE 'Both tours.avg_rating and tours.rating are synced for compatibility';
  RAISE NOTICE '============================================================================';
END $$;
