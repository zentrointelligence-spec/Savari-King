-- Migration: Add more optional vehicle choices for tours
-- Description: Expands the optional vehicles available to provide more flexibility

-- ============================================================================
-- ENHANCED STRATEGY: Give each tour 2-3 optional vehicle choices
-- This allows users to:
-- 1. Add extra capacity for larger groups
-- 2. Upgrade to more comfortable vehicles
-- 3. Mix and match vehicles based on needs
-- ============================================================================

-- For tours with max_group_size 8-12
-- Add all vehicles from 8 capacity and up
INSERT INTO tour_vehicles (tour_id, vehicle_id)
SELECT DISTINCT t.id, v.id
FROM tours t
CROSS JOIN vehicles v
WHERE t.is_active = true
  AND t.max_group_size BETWEEN 8 AND 12
  AND v.capacity >= 8
  AND NOT EXISTS (
    -- Don't add if already in tour_vehicles
    SELECT 1 FROM tour_vehicles tv2
    WHERE tv2.tour_id = t.id AND tv2.vehicle_id = v.id
  )
  AND NOT EXISTS (
    -- Don't add if it's a default vehicle for any tier
    SELECT 1 FROM packagetiers pt
    WHERE pt.tour_id = t.id AND pt.included_vehicle_id = v.id
  );

-- For tours with max_group_size 13-20
-- Give them access to additional larger vehicles
INSERT INTO tour_vehicles (tour_id, vehicle_id)
SELECT DISTINCT t.id, v.id
FROM tours t
CROSS JOIN vehicles v
WHERE t.is_active = true
  AND t.max_group_size BETWEEN 13 AND 20
  AND v.capacity >= 12
  AND NOT EXISTS (
    SELECT 1 FROM tour_vehicles tv2
    WHERE tv2.tour_id = t.id AND tv2.vehicle_id = v.id
  )
  AND NOT EXISTS (
    SELECT 1 FROM packagetiers pt
    WHERE pt.tour_id = t.id AND pt.included_vehicle_id = v.id
  );

-- For tours with max_group_size 5-7
-- Add more mid-range options
INSERT INTO tour_vehicles (tour_id, vehicle_id)
SELECT DISTINCT t.id, v.id
FROM tours t
CROSS JOIN vehicles v
WHERE t.is_active = true
  AND t.max_group_size BETWEEN 5 AND 7
  AND v.id IN (1, 5, 6) -- Add Sedan, Grand Bus, Voiture Eco
  AND NOT EXISTS (
    SELECT 1 FROM tour_vehicles tv2
    WHERE tv2.tour_id = t.id AND tv2.vehicle_id = v.id
  )
  AND NOT EXISTS (
    SELECT 1 FROM packagetiers pt
    WHERE pt.tour_id = t.id AND pt.included_vehicle_id = v.id
  );

-- For tours with max_group_size <= 4
-- Add more small vehicle options
INSERT INTO tour_vehicles (tour_id, vehicle_id)
SELECT DISTINCT t.id, v.id
FROM tours t
CROSS JOIN vehicles v
WHERE t.is_active = true
  AND t.max_group_size <= 4
  AND v.capacity <= 8
  AND NOT EXISTS (
    SELECT 1 FROM tour_vehicles tv2
    WHERE tv2.tour_id = t.id AND tv2.vehicle_id = v.id
  )
  AND NOT EXISTS (
    SELECT 1 FROM packagetiers pt
    WHERE pt.tour_id = t.id AND pt.included_vehicle_id = v.id
  );

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show count of optional vehicles per tour
SELECT
    t.id,
    t.name,
    t.max_group_size,
    COUNT(tv.vehicle_id) as optional_vehicles_count
FROM tours t
LEFT JOIN tour_vehicles tv ON t.id = tv.tour_id
WHERE t.is_active = true
GROUP BY t.id, t.name, t.max_group_size
ORDER BY t.max_group_size DESC, t.id;

-- Show detailed view for a sample tour
SELECT
    t.id as tour_id,
    t.name as tour_name,
    t.max_group_size,
    v.id as vehicle_id,
    v.name as vehicle_name,
    v.capacity,
    v.comfort_level,
    v.price_per_day
FROM tours t
JOIN tour_vehicles tv ON t.id = tv.tour_id
JOIN vehicles v ON tv.vehicle_id = v.id
WHERE t.id = 1
ORDER BY v.capacity;
