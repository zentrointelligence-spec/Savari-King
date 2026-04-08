-- ============================================================================
-- Script SQL pour assigner des véhicules à tous les tours actifs
-- ============================================================================
-- Logique d'assignation basée sur max_group_size du tour:
-- - Petits groupes (1-4 personnes) : Sedan, SUV
-- - Groupes moyens (5-12 personnes) : SUV, Van, Mini Bus
-- - Grands groupes (13+ personnes) : Mini Bus, Grand Bus
-- ============================================================================

-- Nettoyer d'abord les assignations existantes (optionnel, décommenter si besoin)
-- DELETE FROM tour_vehicles;

-- ============================================================================
-- Fonction helper pour assigner des véhicules selon la capacité du tour
-- ============================================================================

-- Assigner des véhicules pour les tours avec petite capacité (1-4 personnes)
INSERT INTO tour_vehicles (tour_id, vehicle_id)
SELECT
    t.id as tour_id,
    v.id as vehicle_id
FROM tours t
CROSS JOIN vehicles v
WHERE t.is_active = true
  AND t.max_group_size <= 4
  AND v.capacity >= 4  -- Sedan Confortable ou Voiture Économique
  AND v.capacity <= 7
  AND NOT EXISTS (
    SELECT 1 FROM tour_vehicles tv
    WHERE tv.tour_id = t.id AND tv.vehicle_id = v.id
  );

-- Assigner des véhicules pour les tours avec capacité moyenne (5-8 personnes)
INSERT INTO tour_vehicles (tour_id, vehicle_id)
SELECT
    t.id as tour_id,
    v.id as vehicle_id
FROM tours t
CROSS JOIN vehicles v
WHERE t.is_active = true
  AND t.max_group_size > 4
  AND t.max_group_size <= 8
  AND v.capacity >= 7  -- SUV 7 places ou Van 8 places
  AND v.capacity <= 12
  AND NOT EXISTS (
    SELECT 1 FROM tour_vehicles tv
    WHERE tv.tour_id = t.id AND tv.vehicle_id = v.id
  );

-- Assigner des véhicules pour les tours avec capacité moyenne-grande (9-12 personnes)
INSERT INTO tour_vehicles (tour_id, vehicle_id)
SELECT
    t.id as tour_id,
    v.id as vehicle_id
FROM tours t
CROSS JOIN vehicles v
WHERE t.is_active = true
  AND t.max_group_size > 8
  AND t.max_group_size <= 12
  AND v.capacity >= 8  -- Van, Mini Bus
  AND v.capacity <= 15
  AND NOT EXISTS (
    SELECT 1 FROM tour_vehicles tv
    WHERE tv.tour_id = t.id AND tv.vehicle_id = v.id
  );

-- Assigner des véhicules pour les tours avec grande capacité (13-20 personnes)
INSERT INTO tour_vehicles (tour_id, vehicle_id)
SELECT
    t.id as tour_id,
    v.id as vehicle_id
FROM tours t
CROSS JOIN vehicles v
WHERE t.is_active = true
  AND t.max_group_size > 12
  AND t.max_group_size <= 20
  AND v.capacity >= 12  -- Mini Bus, Grand Bus
  AND NOT EXISTS (
    SELECT 1 FROM tour_vehicles tv
    WHERE tv.tour_id = t.id AND tv.vehicle_id = v.id
  );

-- Assigner des véhicules pour les tours avec très grande capacité (21+ personnes)
INSERT INTO tour_vehicles (tour_id, vehicle_id)
SELECT
    t.id as tour_id,
    v.id as vehicle_id
FROM tours t
CROSS JOIN vehicles v
WHERE t.is_active = true
  AND t.max_group_size > 20
  AND v.capacity >= 12  -- Mini Bus et Grand Bus
  AND NOT EXISTS (
    SELECT 1 FROM tour_vehicles tv
    WHERE tv.tour_id = t.id AND tv.vehicle_id = v.id
  );

-- ============================================================================
-- Ajouter aussi l'option économique pour tous les tours (option budget)
-- ============================================================================
INSERT INTO tour_vehicles (tour_id, vehicle_id)
SELECT DISTINCT
    t.id as tour_id,
    6 as vehicle_id  -- ID 6 = Voiture Économique
FROM tours t
WHERE t.is_active = true
  AND t.max_group_size <= 4
  AND NOT EXISTS (
    SELECT 1 FROM tour_vehicles tv
    WHERE tv.tour_id = t.id AND tv.vehicle_id = 6
  );

-- ============================================================================
-- Vérification finale
-- ============================================================================
-- Afficher le résumé par tour
SELECT
    t.id,
    t.name,
    t.max_group_size,
    COUNT(tv.vehicle_id) as nb_vehicles_assigned,
    STRING_AGG(v.name, ', ' ORDER BY v.price_per_day) as vehicles
FROM tours t
LEFT JOIN tour_vehicles tv ON t.id = tv.tour_id
LEFT JOIN vehicles v ON tv.vehicle_id = v.id
WHERE t.is_active = true
GROUP BY t.id, t.name, t.max_group_size
ORDER BY t.id;

-- Statistiques globales
SELECT
    COUNT(DISTINCT tour_id) as tours_with_vehicles,
    COUNT(*) as total_assignments,
    ROUND(AVG(vehicle_count), 2) as avg_vehicles_per_tour
FROM (
    SELECT tour_id, COUNT(*) as vehicle_count
    FROM tour_vehicles
    GROUP BY tour_id
) sub;
