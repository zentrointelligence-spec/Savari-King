-- ============================================================
-- Migration: Enhance Vehicles System for Booking Flow
-- Date: 2025-10-09
-- Description:
--   1. Add new columns to vehicles table
--   2. Create tour_vehicles junction table
--   3. Insert sample vehicle data
--   4. Link vehicles to existing tours
-- ============================================================

-- Step 1: Add new columns to vehicles table
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS icon VARCHAR(100),
  ADD COLUMN IF NOT EXISTS features TEXT[],
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Step 2: Create tour_vehicles junction table
CREATE TABLE IF NOT EXISTS tour_vehicles (
  tour_id INTEGER NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (tour_id, vehicle_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tour_vehicles_tour_id ON tour_vehicles(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_vehicles_vehicle_id ON tour_vehicles(vehicle_id);

-- Step 3: Insert sample vehicle data
INSERT INTO vehicles (name, capacity, price_per_day, type, icon, features, description, image_url) VALUES
  ('Sedan Confortable', 4, 3500.00, 'car', 'fa-car',
   ARRAY['Climatisation', 'WiFi', 'GPS', 'Bluetooth'],
   'Berline confortable parfaite pour les petits groupes et les couples. Idéale pour les trajets en ville et les routes de montagne.',
   'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500'),

  ('SUV Spacieux 7 Places', 7, 5500.00, 'suv', 'fa-car-side',
   ARRAY['Climatisation', 'WiFi', 'GPS', 'Espace Bagages', 'Sièges Cuir'],
   'SUV spacieux idéal pour les familles et groupes moyens. Grand coffre pour tous vos bagages.',
   'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500'),

  ('Mini Bus 12 Places', 12, 8500.00, 'bus', 'fa-bus',
   ARRAY['Climatisation', 'WiFi', 'Sièges Inclinables', 'Espace Bagages XL', 'USB Charging'],
   'Mini-bus confortable pour groupes moyens à grands. Parfait pour les excursions en groupe.',
   'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500'),

  ('Van de Luxe 8 Places', 8, 7000.00, 'van', 'fa-shuttle-van',
   ARRAY['Climatisation', 'WiFi', 'Sièges Cuir Premium', 'Système Audio', 'Toit Panoramique'],
   'Van de luxe avec tout le confort pour voyager en grand style. Idéal pour les groupes VIP.',
   'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=500'),

  ('Grand Bus 25 Places', 25, 15000.00, 'bus', 'fa-bus-alt',
   ARRAY['Climatisation', 'WiFi', 'Sièges Inclinables', 'WC à bord', 'Système Audio/Vidéo', 'Espace Bagages XXL'],
   'Grand bus de tourisme pour les grands groupes. Confort maximal pour les longs trajets.',
   'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500'),

  ('Voiture Économique 4 Places', 4, 2500.00, 'car', 'fa-car',
   ARRAY['Climatisation', 'GPS', 'Économique'],
   'Option économique pour les voyageurs à budget serré. Fiable et confortable.',
   'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500')
ON CONFLICT DO NOTHING;

-- Step 4: Link vehicles to sample tours
-- Note: This assumes tours with IDs 1, 6, 81, 183 exist
-- Adjust the tour IDs based on your actual database

-- Tour 1: Gets access to 4 vehicles (economy to luxury options)
INSERT INTO tour_vehicles (tour_id, vehicle_id)
SELECT 1, id FROM vehicles WHERE name IN (
  'Voiture Économique 4 Places',
  'Sedan Confortable',
  'SUV Spacieux 7 Places',
  'Van de Luxe 8 Places'
)
ON CONFLICT DO NOTHING;

-- Tour 6: Gets access to mid-range vehicles
INSERT INTO tour_vehicles (tour_id, vehicle_id)
SELECT 6, id FROM vehicles WHERE name IN (
  'Sedan Confortable',
  'SUV Spacieux 7 Places',
  'Mini Bus 12 Places'
)
ON CONFLICT DO NOTHING;

-- Tour 81: Gets access to all vehicles (popular tour)
INSERT INTO tour_vehicles (tour_id, vehicle_id)
SELECT 81, id FROM vehicles
ON CONFLICT DO NOTHING;

-- Tour 183: Gets access to luxury and group vehicles
INSERT INTO tour_vehicles (tour_id, vehicle_id)
SELECT 183, id FROM vehicles WHERE name IN (
  'SUV Spacieux 7 Places',
  'Van de Luxe 8 Places',
  'Mini Bus 12 Places',
  'Grand Bus 25 Places'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Verification Queries (Run these to verify the migration)
-- ============================================================

-- Check vehicles table structure
-- \d vehicles

-- Check tour_vehicles table structure
-- \d tour_vehicles

-- Count vehicles
-- SELECT COUNT(*) as total_vehicles FROM vehicles;

-- Check vehicles linked to tours
-- SELECT t.id, t.name, COUNT(tv.vehicle_id) as vehicle_count
-- FROM tours t
-- LEFT JOIN tour_vehicles tv ON t.id = tv.tour_id
-- GROUP BY t.id, t.name
-- HAVING COUNT(tv.vehicle_id) > 0
-- ORDER BY t.id;

-- ============================================================
-- Rollback (if needed)
-- ============================================================

-- To rollback this migration:
-- DROP TABLE IF EXISTS tour_vehicles;
-- ALTER TABLE vehicles DROP COLUMN IF EXISTS type;
-- ALTER TABLE vehicles DROP COLUMN IF EXISTS icon;
-- ALTER TABLE vehicles DROP COLUMN IF EXISTS features;
-- ALTER TABLE vehicles DROP COLUMN IF EXISTS description;
-- ALTER TABLE vehicles DROP COLUMN IF EXISTS image_url;
-- DELETE FROM vehicles WHERE name IN ('Sedan Confortable', 'SUV Spacieux 7 Places', 'Mini Bus 12 Places', 'Van de Luxe 8 Places', 'Grand Bus 25 Places', 'Voiture Économique 4 Places');
