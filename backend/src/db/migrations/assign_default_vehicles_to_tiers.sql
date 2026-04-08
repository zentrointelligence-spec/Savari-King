-- Migration: Assign default vehicles to package tiers
-- Description: Assigns appropriate default vehicles to each tour tier based on comfort level and capacity

-- ============================================================================
-- STRATEGY:
-- - Standard tier gets the smallest vehicle that can accommodate max_group_size
-- - Comfort tier gets a mid-range comfortable vehicle
-- - Premium/Luxury tier gets the most luxurious vehicle with highest capacity
-- ============================================================================

-- First, let's see what we're working with
SELECT
    v.id,
    v.name,
    v.capacity,
    v.comfort_level,
    v.price_per_day
FROM vehicles v
ORDER BY v.comfort_level DESC, v.capacity DESC;

-- ============================================================================
-- UPDATE STRATEGY BY TOUR CAPACITY:
-- ============================================================================
-- Tours with max_group_size <= 4:
--   Standard: Vehicle 6 (Voiture Économique 4 Places - Standard)
--   Comfort: Vehicle 1 (Sedan Confortable 4 Places - Comfort)
--   Premium/Luxury: Vehicle 2 (SUV Spacieux 7 Places - Comfort) or Vehicle 4 (Van de Luxe 8 Places - Premium)

-- Tours with max_group_size 5-7:
--   Standard: Vehicle 2 (SUV Spacieux 7 Places - Comfort)
--   Comfort: Vehicle 4 (Van de Luxe 8 Places - Premium)
--   Premium/Luxury: Vehicle 3 (Mini Bus 12 Places - Premium)

-- Tours with max_group_size 8-12:
--   Standard: Vehicle 3 (Mini Bus 12 Places - Premium)
--   Comfort: Vehicle 3 (Mini Bus 12 Places - Premium)
--   Premium/Luxury: Vehicle 5 (Grand Bus 25 Places - Premium)

-- Tours with max_group_size 13-20:
--   Standard: Vehicle 5 (Grand Bus 25 Places - Premium)
--   Comfort: Vehicle 5 (Grand Bus 25 Places - Premium)
--   Premium/Luxury: Vehicle 5 (Grand Bus 25 Places - Premium)

-- ============================================================================
-- APPLY UPDATES
-- ============================================================================

-- For tours with max_group_size <= 4
-- Standard tier
UPDATE packagetiers pt
SET included_vehicle_id = 6
FROM tours t
WHERE pt.tour_id = t.id
  AND t.is_active = true
  AND t.max_group_size <= 4
  AND pt.tier_name = 'Standard';

-- Comfort tier (capacity 4)
UPDATE packagetiers pt
SET included_vehicle_id = 1
FROM tours t
WHERE pt.tour_id = t.id
  AND t.is_active = true
  AND t.max_group_size <= 4
  AND pt.tier_name IN ('Comfort', 'Premium');

-- Luxury tier (capacity 4)
UPDATE packagetiers pt
SET included_vehicle_id = 4
FROM tours t
WHERE pt.tour_id = t.id
  AND t.is_active = true
  AND t.max_group_size <= 4
  AND pt.tier_name = 'Luxury';

-- ============================================================================
-- For tours with max_group_size 5-7
-- Standard tier
UPDATE packagetiers pt
SET included_vehicle_id = 2
FROM tours t
WHERE pt.tour_id = t.id
  AND t.is_active = true
  AND t.max_group_size BETWEEN 5 AND 7
  AND pt.tier_name = 'Standard';

-- Comfort/Premium tier
UPDATE packagetiers pt
SET included_vehicle_id = 4
FROM tours t
WHERE pt.tour_id = t.id
  AND t.is_active = true
  AND t.max_group_size BETWEEN 5 AND 7
  AND pt.tier_name IN ('Comfort', 'Premium');

-- Luxury tier
UPDATE packagetiers pt
SET included_vehicle_id = 3
FROM tours t
WHERE pt.tour_id = t.id
  AND t.is_active = true
  AND t.max_group_size BETWEEN 5 AND 7
  AND pt.tier_name = 'Luxury';

-- ============================================================================
-- For tours with max_group_size 8-12
-- All tiers need at least Mini Bus (12 capacity)
UPDATE packagetiers pt
SET included_vehicle_id = 3
FROM tours t
WHERE pt.tour_id = t.id
  AND t.is_active = true
  AND t.max_group_size BETWEEN 8 AND 12
  AND pt.tier_name IN ('Standard', 'Comfort');

-- Premium/Luxury tier gets the Grand Bus for extra comfort
UPDATE packagetiers pt
SET included_vehicle_id = 5
FROM tours t
WHERE pt.tour_id = t.id
  AND t.is_active = true
  AND t.max_group_size BETWEEN 8 AND 12
  AND pt.tier_name IN ('Premium', 'Luxury');

-- ============================================================================
-- For tours with max_group_size 13-20
-- All tiers need Grand Bus (25 capacity)
UPDATE packagetiers pt
SET included_vehicle_id = 5
FROM tours t
WHERE pt.tour_id = t.id
  AND t.is_active = true
  AND t.max_group_size BETWEEN 13 AND 20
  AND pt.tier_name IN ('Standard', 'Comfort', 'Premium', 'Luxury');

-- ============================================================================
-- For tours with max_group_size > 20 (if any)
-- All tiers get Grand Bus
UPDATE packagetiers pt
SET included_vehicle_id = 5
FROM tours t
WHERE pt.tour_id = t.id
  AND t.is_active = true
  AND t.max_group_size > 20
  AND pt.tier_name IN ('Standard', 'Comfort', 'Premium', 'Luxury');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Show summary of assignments
SELECT
    t.id,
    t.name,
    t.max_group_size,
    pt.tier_name,
    v.name as vehicle_name,
    v.capacity as vehicle_capacity,
    v.comfort_level,
    v.price_per_day
FROM packagetiers pt
JOIN tours t ON pt.tour_id = t.id
JOIN vehicles v ON pt.included_vehicle_id = v.id
WHERE t.is_active = true
ORDER BY t.max_group_size DESC, t.id,
    CASE pt.tier_name
        WHEN 'Standard' THEN 1
        WHEN 'Comfort' THEN 2
        WHEN 'Premium' THEN 3
        WHEN 'Luxury' THEN 4
    END;

-- Count assignments
SELECT
    COUNT(*) as total_assignments,
    COUNT(DISTINCT pt.tour_id) as tours_with_vehicles,
    COUNT(CASE WHEN pt.included_vehicle_id IS NULL THEN 1 END) as missing_vehicles
FROM packagetiers pt
JOIN tours t ON pt.tour_id = t.id
WHERE t.is_active = true;
