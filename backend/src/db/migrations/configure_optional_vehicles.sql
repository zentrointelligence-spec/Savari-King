-- Migration: Configure optional vehicles for tours
-- Description: Populates tour_vehicles with optional vehicles available for each tour
-- Strategy: Each tour gets access to multiple vehicle options based on its max_group_size

-- Clear existing tour_vehicles data (they were probably test data)
TRUNCATE TABLE tour_vehicles CASCADE;

-- ============================================================================
-- STRATEGY FOR OPTIONAL VEHICLES:
-- - Tours get access to vehicles that are NOT their default vehicle
-- - Smaller tours get smaller vehicle options
-- - Larger tours get all vehicle options
-- - This allows users to add extra capacity or upgrade comfort
-- ============================================================================

-- For tours with max_group_size <= 4
-- They can add: Sedan, SUV, Van (excluding their defaults)
INSERT INTO tour_vehicles (tour_id, vehicle_id)
SELECT DISTINCT t.id, v.id
FROM tours t
CROSS JOIN vehicles v
WHERE t.is_active = true
  AND t.max_group_size <= 4
  AND v.id IN (1, 2, 4, 6) -- Sedan, SUV, Van Luxe, Voiture Eco
  -- Exclude vehicles already assigned as default to any tier of this tour
  AND NOT EXISTS (
    SELECT 1 FROM packagetiers pt
    WHERE pt.tour_id = t.id
    AND pt.included_vehicle_id = v.id
  );

-- For tours with max_group_size 5-7
-- They can add: SUV, Van, Mini Bus
INSERT INTO tour_vehicles (tour_id, vehicle_id)
SELECT DISTINCT t.id, v.id
FROM tours t
CROSS JOIN vehicles v
WHERE t.is_active = true
  AND t.max_group_size BETWEEN 5 AND 7
  AND v.id IN (2, 3, 4) -- SUV, Mini Bus, Van Luxe
  AND NOT EXISTS (
    SELECT 1 FROM packagetiers pt
    WHERE pt.tour_id = t.id
    AND pt.included_vehicle_id = v.id
  );

-- For tours with max_group_size 8-12
-- They can add: Mini Bus, Van, Grand Bus
INSERT INTO tour_vehicles (tour_id, vehicle_id)
SELECT DISTINCT t.id, v.id
FROM tours t
CROSS JOIN vehicles v
WHERE t.is_active = true
  AND t.max_group_size BETWEEN 8 AND 12
  AND v.id IN (3, 4, 5) -- Mini Bus, Van Luxe, Grand Bus
  AND NOT EXISTS (
    SELECT 1 FROM packagetiers pt
    WHERE pt.tour_id = t.id
    AND pt.included_vehicle_id = v.id
  );

-- For tours with max_group_size 13-20
-- They can add: Mini Bus, Grand Bus (large capacity vehicles)
INSERT INTO tour_vehicles (tour_id, vehicle_id)
SELECT DISTINCT t.id, v.id
FROM tours t
CROSS JOIN vehicles v
WHERE t.is_active = true
  AND t.max_group_size BETWEEN 13 AND 20
  AND v.id IN (3, 5) -- Mini Bus, Grand Bus
  AND NOT EXISTS (
    SELECT 1 FROM packagetiers pt
    WHERE pt.tour_id = t.id
    AND pt.included_vehicle_id = v.id
  );

-- For tours with max_group_size > 20
-- They can add: Grand Bus only
INSERT INTO tour_vehicles (tour_id, vehicle_id)
SELECT DISTINCT t.id, v.id
FROM tours t
CROSS JOIN vehicles v
WHERE t.is_active = true
  AND t.max_group_size > 20
  AND v.id = 5 -- Grand Bus only
  AND NOT EXISTS (
    SELECT 1 FROM packagetiers pt
    WHERE pt.tour_id = t.id
    AND pt.included_vehicle_id = v.id
  );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Show count of optional vehicles per tour
SELECT
    t.id,
    t.name,
    t.max_group_size,
    COUNT(tv.vehicle_id) as optional_vehicles_count
FROM tours t
LEFT JOIN tour_vehicles tv ON t.tour_id = tv.tour_id
WHERE t.is_active = true
GROUP BY t.id, t.name, t.max_group_size
ORDER BY t.max_group_size DESC, t.id
LIMIT 20;

-- Show detailed view of optional vehicles for a few tours
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
WHERE t.is_active = true
ORDER BY t.id, v.capacity
LIMIT 30;

-- Summary statistics
SELECT
    COUNT(DISTINCT tour_id) as tours_with_optional_vehicles,
    COUNT(*) as total_optional_vehicle_assignments,
    AVG(vehicle_count) as avg_vehicles_per_tour
FROM (
    SELECT tour_id, COUNT(*) as vehicle_count
    FROM tour_vehicles
    GROUP BY tour_id
) subquery;
