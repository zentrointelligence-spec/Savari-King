-- Migration: Fix tour category counting issues
-- Date: 2025-10-19
-- Problems:
--   1. Tours without original_price are excluded from search (tourController line 1176)
--   2. All categories have is_new = true (should be selective)

-- =====================================================
-- PART 1: Set default price for tours without price
-- =====================================================

-- First, let's see which tours don't have prices
SELECT
  id,
  name,
  category_id,
  original_price
FROM tours
WHERE is_active = true AND original_price IS NULL;

-- Set a default price for tours without prices
-- Using a reasonable default of 100 INR (adjust as needed)
UPDATE tours
SET original_price = 100.00
WHERE is_active = true
  AND original_price IS NULL;

SELECT 'Step 1: Added default prices to tours without original_price' AS status;

-- =====================================================
-- PART 2: Fix is_new flag for tour_categories
-- =====================================================

-- Reset all categories to is_new = false first
UPDATE tour_categories
SET is_new = false;

-- Only mark truly new categories as new (e.g., created in last 30 days)
-- Or manually set specific ones
-- For now, let's set none as new (you can adjust later)

SELECT 'Step 2: Reset is_new flag for all tour categories' AS status;

-- If you want to mark specific categories as new, uncomment and adjust:
-- UPDATE tour_categories SET is_new = true WHERE slug IN ('beach-tours', 'wildlife-tours');

-- =====================================================
-- PART 3: Verify the fixes
-- =====================================================

-- Check tours that now have prices
SELECT
  t.id,
  t.name,
  t.original_price,
  tc.name as category
FROM tours t
JOIN tour_categories tc ON t.category_id = tc.id
WHERE t.is_active = true
ORDER BY tc.name, t.name;

-- Check category is_new status
SELECT
  name,
  slug,
  is_new,
  active_tour_count
FROM tour_categories
WHERE is_active = true
ORDER BY name;

-- =====================================================
-- PART 4: Update trigger to count only tours with prices
-- =====================================================

-- Update the trigger function to only count tours with prices
-- This matches the filter used in tourController.js
CREATE OR REPLACE FUNCTION update_category_tour_count()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is an INSERT or UPDATE that makes tour active
  IF (TG_OP = 'INSERT' AND NEW.is_active = true AND NEW.original_price IS NOT NULL) OR
     (TG_OP = 'UPDATE' AND NEW.is_active = true AND NEW.original_price IS NOT NULL AND
      (OLD.is_active = false OR OLD.category_id != NEW.category_id OR OLD.original_price IS NULL)) THEN

    -- Update count for new category (only count tours with prices)
    UPDATE tour_categories
    SET active_tour_count = (
      SELECT COUNT(*)
      FROM tours
      WHERE category_id = NEW.category_id
        AND is_active = true
        AND original_price IS NOT NULL
    )
    WHERE id = NEW.category_id;

    -- If category changed, update old category
    IF TG_OP = 'UPDATE' AND OLD.category_id != NEW.category_id THEN
      UPDATE tour_categories
      SET active_tour_count = (
        SELECT COUNT(*)
        FROM tours
        WHERE category_id = OLD.category_id
          AND is_active = true
          AND original_price IS NOT NULL
      )
      WHERE id = OLD.category_id;
    END IF;

  -- If this is an UPDATE that makes tour inactive or removes price
  ELSIF TG_OP = 'UPDATE' AND
        (NEW.is_active = false OR NEW.original_price IS NULL) AND
        (OLD.is_active = true AND OLD.original_price IS NOT NULL) THEN

    -- Update count
    UPDATE tour_categories
    SET active_tour_count = (
      SELECT COUNT(*)
      FROM tours
      WHERE category_id = NEW.category_id
        AND is_active = true
        AND original_price IS NOT NULL
    )
    WHERE id = NEW.category_id;

  -- If this is a DELETE
  ELSIF TG_OP = 'DELETE' AND OLD.is_active = true AND OLD.original_price IS NOT NULL THEN

    -- Update count
    UPDATE tour_categories
    SET active_tour_count = (
      SELECT COUNT(*)
      FROM tours
      WHERE category_id = OLD.category_id
        AND is_active = true
        AND original_price IS NOT NULL
    )
    WHERE id = OLD.category_id;

    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

SELECT 'Step 4: Updated trigger to match tourController filtering logic' AS status;

-- =====================================================
-- PART 5: Recalculate all category counts
-- =====================================================

-- Now recalculate counts to match the new logic (only tours with prices)
UPDATE tour_categories tc
SET active_tour_count = (
  SELECT COUNT(*)
  FROM tours t
  WHERE t.category_id = tc.id
    AND t.is_active = true
    AND t.original_price IS NOT NULL
);

SELECT 'Step 5: Recalculated all category counts (only tours with prices)' AS status;

-- =====================================================
-- FINAL VERIFICATION
-- =====================================================

SELECT '
╔════════════════════════════════════════════════════════════╗
║  ✓ Migration Completed!                                    ║
║                                                            ║
║  What was fixed:                                           ║
║  1. Added default prices to tours without price            ║
║  2. Reset is_new flag for all categories                   ║
║  3. Updated trigger to match controller filtering          ║
║  4. Recalculated all category counts                       ║
║                                                            ║
║  Verify below that counts now match:                       ║
╚════════════════════════════════════════════════════════════╝
' AS "Migration Status";

-- Final comparison
SELECT
  tc.name,
  tc.slug,
  tc.active_tour_count as homepage_count,
  COUNT(t.id) FILTER (WHERE t.original_price IS NOT NULL) as tours_page_count,
  tc.is_new,
  CASE
    WHEN tc.active_tour_count = COUNT(t.id) FILTER (WHERE t.original_price IS NOT NULL)
    THEN '✓ MATCH'
    ELSE '✗ MISMATCH'
  END as status
FROM tour_categories tc
LEFT JOIN tours t ON t.category_id = tc.id AND t.is_active = true
WHERE tc.is_active = true
GROUP BY tc.id, tc.name, tc.slug, tc.active_tour_count, tc.is_new
ORDER BY tc.name;
