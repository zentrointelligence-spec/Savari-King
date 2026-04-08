-- Migration: Add comfort_level to vehicles table
-- Description: Adds comfort_level field to categorize vehicles by tier (Standard, Comfort, Premium)

-- Add comfort_level column
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS comfort_level VARCHAR(20) DEFAULT 'Standard';

-- Add check constraint to ensure valid values
ALTER TABLE vehicles
ADD CONSTRAINT chk_vehicle_comfort_level
CHECK (comfort_level IN ('Standard', 'Comfort', 'Premium'));

-- Update existing vehicles with appropriate comfort levels based on capacity and price
-- Standard: Économique, petite capacité
UPDATE vehicles SET comfort_level = 'Standard' WHERE id = 6; -- Voiture Économique 4 Places

-- Comfort: Capacité moyenne, confort supérieur
UPDATE vehicles SET comfort_level = 'Comfort' WHERE id IN (1, 2); -- Sedan Confortable, SUV Spacieux

-- Premium: Luxe, grande capacité, équipements haut de gamme
UPDATE vehicles SET comfort_level = 'Premium' WHERE id IN (3, 4, 5); -- Mini Bus, Van de Luxe, Grand Bus

-- Add index for faster queries on comfort_level
CREATE INDEX IF NOT EXISTS idx_vehicles_comfort_level ON vehicles(comfort_level);

-- Display results
SELECT id, name, capacity, price_per_day, comfort_level
FROM vehicles
ORDER BY comfort_level, capacity;
