-- Migration: Fix tour category active_tour_count synchronization
-- Date: 2025-10-19
-- Problem: active_tour_count in tour_categories is not synchronized with actual number of active tours
-- Solution: Create triggers to automatically update the count + fix existing data

-- =====================================================
-- STEP 1: Fix existing data (update all counts now)
-- =====================================================

UPDATE tour_categories tc
SET active_tour_count = (
  SELECT COUNT(*)
  FROM tours t
  WHERE t.category_id = tc.id
    AND t.is_active = true
);

SELECT 'Step 1: Updated existing category counts' AS status;

-- =====================================================
-- STEP 2: Create function to update category tour count
-- =====================================================

CREATE OR REPLACE FUNCTION update_category_tour_count()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is an INSERT or UPDATE that makes tour active
  IF (TG_OP = 'INSERT' AND NEW.is_active = true) OR
     (TG_OP = 'UPDATE' AND NEW.is_active = true AND (OLD.is_active = false OR OLD.category_id != NEW.category_id)) THEN

    -- Increment count for new category
    UPDATE tour_categories
    SET active_tour_count = (
      SELECT COUNT(*)
      FROM tours
      WHERE category_id = NEW.category_id AND is_active = true
    )
    WHERE id = NEW.category_id;

    -- If category changed, decrement old category
    IF TG_OP = 'UPDATE' AND OLD.category_id != NEW.category_id THEN
      UPDATE tour_categories
      SET active_tour_count = (
        SELECT COUNT(*)
        FROM tours
        WHERE category_id = OLD.category_id AND is_active = true
      )
      WHERE id = OLD.category_id;
    END IF;

  -- If this is an UPDATE that makes tour inactive
  ELSIF TG_OP = 'UPDATE' AND NEW.is_active = false AND OLD.is_active = true THEN

    -- Decrement count
    UPDATE tour_categories
    SET active_tour_count = (
      SELECT COUNT(*)
      FROM tours
      WHERE category_id = NEW.category_id AND is_active = true
    )
    WHERE id = NEW.category_id;

  -- If this is a DELETE
  ELSIF TG_OP = 'DELETE' AND OLD.is_active = true THEN

    -- Decrement count
    UPDATE tour_categories
    SET active_tour_count = (
      SELECT COUNT(*)
      FROM tours
      WHERE category_id = OLD.category_id AND is_active = true
    )
    WHERE id = OLD.category_id;

    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

SELECT 'Step 2: Created function update_category_tour_count()' AS status;

-- =====================================================
-- STEP 3: Create trigger on tours table
-- =====================================================

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_update_category_count ON tours;

-- Create trigger
CREATE TRIGGER trigger_update_category_count
AFTER INSERT OR UPDATE OR DELETE ON tours
FOR EACH ROW
EXECUTE FUNCTION update_category_tour_count();

SELECT 'Step 3: Created trigger trigger_update_category_count' AS status;

-- =====================================================
-- STEP 4: Verify the fix
-- =====================================================

SELECT
  tc.name,
  tc.slug,
  tc.active_tour_count as stored_count,
  COUNT(t.id) as actual_count,
  CASE
    WHEN tc.active_tour_count = COUNT(t.id) THEN '✓ SYNC'
    ELSE '✗ OUT OF SYNC'
  END as status
FROM tour_categories tc
LEFT JOIN tours t ON t.category_id = tc.id AND t.is_active = true
WHERE tc.is_active = true
GROUP BY tc.id, tc.name, tc.slug, tc.active_tour_count
ORDER BY tc.name;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT '
╔════════════════════════════════════════════════════════════╗
║  ✓ Migration Completed Successfully!                      ║
║                                                            ║
║  What was fixed:                                           ║
║  - Updated all existing category counts                    ║
║  - Created automatic synchronization trigger               ║
║  - Counts will now auto-update when tours change           ║
║                                                            ║
║  The homepage will now show correct tour counts!           ║
╚════════════════════════════════════════════════════════════╝
' AS "Migration Status";
