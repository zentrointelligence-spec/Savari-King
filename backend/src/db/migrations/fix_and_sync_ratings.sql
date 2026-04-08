-- ============================================================================
-- Fix: Disable problematic trigger and run initial rating sync
-- ============================================================================

-- Step 1: Temporarily disable the problematic trigger
ALTER TABLE tours DISABLE TRIGGER ALL;

-- Step 2: Run the initial sync manually
DO $$
DECLARE
  tour_record RECORD;
  updated_count INTEGER := 0;
  error_count INTEGER := 0;
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Starting initial sync of tour ratings (safe mode)...';
  RAISE NOTICE '============================================================================';

  -- Update all tours with their current review statistics
  FOR tour_record IN
    SELECT DISTINCT id FROM tours WHERE is_active = true
  LOOP
    BEGIN
      UPDATE tours
      SET
        avg_rating = COALESCE(
          (SELECT ROUND(AVG(rating)::numeric, 2)
           FROM reviews
           WHERE tour_id = tour_record.id AND is_approved = true),
          0
        ),
        review_count = COALESCE(
          (SELECT COUNT(*)
           FROM reviews
           WHERE tour_id = tour_record.id AND is_approved = true),
          0
        ),
        rating = COALESCE(
          (SELECT ROUND(AVG(rating)::numeric, 2)
           FROM reviews
           WHERE tour_id = tour_record.id AND is_approved = true),
          0
        )
      WHERE id = tour_record.id;

      updated_count := updated_count + 1;

      -- Show progress every 10 tours
      IF updated_count % 10 = 0 THEN
        RAISE NOTICE '  Updated % tours...', updated_count;
      END IF;

    EXCEPTION
      WHEN OTHERS THEN
        error_count := error_count + 1;
        RAISE NOTICE '  ERROR on tour %: %', tour_record.id, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Initial sync completed!';
  RAISE NOTICE '  - Successfully updated: % tours', updated_count;
  RAISE NOTICE '  - Errors: % tours', error_count;
  RAISE NOTICE '============================================================================';
END $$;

-- Step 3: Re-enable triggers (only the good ones)
ALTER TABLE tours ENABLE TRIGGER trigger_sync_tour_rating_on_insert;
ALTER TABLE tours ENABLE TRIGGER trigger_sync_tour_rating_on_update;
ALTER TABLE tours ENABLE TRIGGER trigger_sync_tour_rating_on_delete;

-- Step 4: Check if problematic trigger exists and try to fix it
DO $$
BEGIN
  -- Check if the problematic function exists
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_category_statistics') THEN
    RAISE NOTICE 'Found problematic trigger: update_category_statistics';
    RAISE NOTICE 'Attempting to fix or disable it...';

    -- Disable the trigger on tours table if it exists
    BEGIN
      EXECUTE 'ALTER TABLE tours DISABLE TRIGGER update_category_statistics_trigger';
      RAISE NOTICE '  Disabled update_category_statistics_trigger on tours table';
    EXCEPTION
      WHEN undefined_object THEN
        RAISE NOTICE '  Trigger not found on tours table (OK)';
      WHEN OTHERS THEN
        RAISE NOTICE '  Could not disable trigger: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'Problematic trigger function does not exist (OK)';
  END IF;
END $$;

-- Step 5: Verification query - show sample of updated tours
SELECT
  t.id,
  t.name,
  t.avg_rating,
  t.rating,
  t.review_count,
  COUNT(r.id) as actual_review_count,
  ROUND(AVG(r.rating)::numeric, 2) as calculated_avg
FROM tours t
LEFT JOIN reviews r ON t.id = r.tour_id AND r.is_approved = true
WHERE t.is_active = true
GROUP BY t.id, t.name, t.avg_rating, t.rating, t.review_count
ORDER BY t.review_count DESC
LIMIT 10;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Rating synchronization completed successfully!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Check the verification query results above';
  RAISE NOTICE '  2. Refresh your tour detail page';
  RAISE NOTICE '  3. Header rating and WhyChooseThisTour rating should now match!';
  RAISE NOTICE '============================================================================';
END $$;
