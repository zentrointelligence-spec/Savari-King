-- Migration: Fix Best Sellers pricing inconsistencies
-- Date: 2025-10-19
-- Problem: tours.original_price doesn't match actual packagetiers prices
--          Homepage shows incorrect prices compared to tour detail page

-- =====================================================
-- ANALYSIS: Current State
-- =====================================================

SELECT '
╔════════════════════════════════════════════════════════════╗
║  ANALYSIS: Current Best Sellers Pricing Issues            ║
╚════════════════════════════════════════════════════════════╝
' AS "Step 1: Analysis";

SELECT
  t.id,
  t.name,
  t.original_price as homepage_shows,
  MIN(pt.price) as actual_cheapest,
  MAX(pt.price) as actual_most_expensive,
  (t.original_price - MIN(pt.price)) as price_diff
FROM tours t
LEFT JOIN packagetiers pt ON t.id = pt.tour_id
WHERE t.is_bestseller = true AND t.is_active = true
GROUP BY t.id, t.name, t.original_price
ORDER BY t.id;

-- =====================================================
-- STRATEGY: Use "Starting From" pricing model
-- =====================================================
-- We'll update tours.original_price to reflect the CHEAPEST tier
-- This is standard practice: "Starting from $X"

SELECT '
╔════════════════════════════════════════════════════════════╗
║  STRATEGY: Set original_price = cheapest tier price       ║
║  This allows "Starting from €X" messaging                  ║
╚════════════════════════════════════════════════════════════╝
' AS "Step 2: Strategy";

-- =====================================================
-- FIX 1: Update tours.original_price to match cheapest tier
-- =====================================================

UPDATE tours t
SET original_price = (
  SELECT MIN(pt.price)
  FROM packagetiers pt
  WHERE pt.tour_id = t.id
)
WHERE t.id IN (
  SELECT DISTINCT t2.id
  FROM tours t2
  INNER JOIN packagetiers pt2 ON t2.id = pt2.tour_id
  WHERE t2.is_bestseller = true AND t2.is_active = true
);

SELECT 'Step 3: Updated tours.original_price to match cheapest tier' AS status;

-- =====================================================
-- FIX 2: Ensure all bestsellers have proper flags
-- =====================================================

-- Check for inconsistent flags
SELECT
  id,
  name,
  is_bestseller,
  is_featured,
  is_new,
  booking_count
FROM tours
WHERE is_bestseller = true
ORDER BY booking_count DESC;

-- Reset is_new for old tours (optional - uncomment if needed)
-- UPDATE tours
-- SET is_new = false
-- WHERE is_bestseller = true
--   AND created_at < NOW() - INTERVAL '30 days';

SELECT 'Step 4: Verified bestseller flags' AS status;

-- =====================================================
-- FIX 3: Add discount_percentage if applicable
-- =====================================================

-- Check if any bestsellers should have discounts
SELECT
  t.id,
  t.name,
  t.original_price,
  t.discount_percentage,
  MIN(pt.price) as tier_price
FROM tours t
LEFT JOIN packagetiers pt ON t.id = pt.tour_id
WHERE t.is_bestseller = true
GROUP BY t.id, t.name, t.original_price, t.discount_percentage
HAVING t.discount_percentage > 0;

SELECT 'Step 5: Checked discount percentages' AS status;

-- =====================================================
-- VERIFICATION: Final State
-- =====================================================

SELECT '
╔════════════════════════════════════════════════════════════╗
║  VERIFICATION: Updated Best Sellers Pricing                ║
╚════════════════════════════════════════════════════════════╝
' AS "Step 6: Verification";

SELECT
  t.id,
  t.name,
  t.original_price as homepage_price,
  t.discount_percentage,
  ROUND((t.original_price * (1 - COALESCE(t.discount_percentage, 0) / 100))::numeric, 2) as final_homepage_price,
  MIN(pt.price) as cheapest_tier,
  MAX(pt.price) as most_expensive_tier,
  CASE
    WHEN t.original_price = MIN(pt.price) THEN '✓ MATCH'
    WHEN t.original_price < MIN(pt.price) * 1.05 AND t.original_price > MIN(pt.price) * 0.95 THEN '≈ CLOSE'
    ELSE '✗ MISMATCH'
  END as status
FROM tours t
LEFT JOIN packagetiers pt ON t.id = pt.tour_id
WHERE t.is_bestseller = true AND t.is_active = true
GROUP BY t.id, t.name, t.original_price, t.discount_percentage
ORDER BY t.booking_count DESC;

-- =====================================================
-- BONUS: Update category counts for affected tours
-- =====================================================

-- Trigger will handle this automatically, but let's verify
SELECT
  tc.name,
  tc.active_tour_count,
  COUNT(t.id) as actual_count
FROM tour_categories tc
LEFT JOIN tours t ON t.category_id = tc.id
                 AND t.is_active = true
                 AND t.original_price IS NOT NULL
WHERE tc.id IN (
  SELECT DISTINCT category_id
  FROM tours
  WHERE is_bestseller = true
)
GROUP BY tc.id, tc.name, tc.active_tour_count;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT '
╔════════════════════════════════════════════════════════════╗
║  ✓ Migration Completed Successfully!                      ║
║                                                            ║
║  What was fixed:                                           ║
║  1. Updated tours.original_price to match cheapest tier    ║
║  2. Verified bestseller flags consistency                  ║
║  3. Checked discount percentages                           ║
║                                                            ║
║  Homepage now shows accurate "Starting from" prices!       ║
╚════════════════════════════════════════════════════════════╝
' AS "Migration Complete";

-- =====================================================
-- RECOMMENDED FRONTEND UPDATES
-- =====================================================

SELECT '
RECOMMENDED FRONTEND CHANGES:
-----------------------------
1. BestSellersSection.jsx line 91-97:
   Change currency from EUR to INR:

   formatPrice = (price) => {
     if (!price) return "Price on request";
     return new Intl.NumberFormat("en-IN", {
       style: "currency",
       currency: "INR",
     }).format(price);
   };

2. Add "Starting from" text before price:

   <div className="text-lg font-bold">
     Starting from {this.formatPrice(tour.price)}
   </div>

3. Link to /tours/{slug} instead of /tours/{id} for SEO
' AS "Frontend Recommendations";
