-- ============================================================
-- Migration: Translate Vehicle Data to English
-- Date: 2025-10-11
-- Description:
--   Translate all vehicle data (names, descriptions, features) from French to English
--   This ensures database content is in English while UI labels use i18n translations
-- ============================================================

-- Vehicle 1: Sedan Confortable → Comfortable Sedan
UPDATE vehicles
SET
  name = 'Comfortable Sedan',
  description = 'Comfortable sedan perfect for small groups and couples. Ideal for city trips and mountain roads.',
  features = ARRAY['Air Conditioning', 'WiFi', 'GPS', 'Bluetooth']
WHERE id = 1;

-- Vehicle 2: SUV Spacieux 7 Places → Spacious 7-Seater SUV
UPDATE vehicles
SET
  name = 'Spacious 7-Seater SUV',
  description = 'Spacious SUV ideal for families and medium-sized groups. Large trunk for all your luggage.',
  features = ARRAY['Air Conditioning', 'WiFi', 'GPS', 'Luggage Space', 'Leather Seats']
WHERE id = 2;

-- Vehicle 3: Mini Bus 12 Places → 12-Seater Minibus
UPDATE vehicles
SET
  name = '12-Seater Minibus',
  description = 'Comfortable minibus for medium to large groups. Perfect for group excursions.',
  features = ARRAY['Air Conditioning', 'WiFi', 'Reclining Seats', 'XL Luggage Space', 'USB Charging']
WHERE id = 3;

-- Vehicle 4: Van de Luxe 8 Places → Luxury 8-Seater Van
UPDATE vehicles
SET
  name = 'Luxury 8-Seater Van',
  description = 'Luxury van with all the comfort for traveling in grand style. Ideal for VIP groups.',
  features = ARRAY['Air Conditioning', 'WiFi', 'Premium Leather Seats', 'Audio System', 'Panoramic Roof']
WHERE id = 4;

-- Vehicle 5: Grand Bus 25 Places → Large 25-Seater Bus
UPDATE vehicles
SET
  name = 'Large 25-Seater Bus',
  description = 'Large tour bus for big groups. Maximum comfort for long journeys.',
  features = ARRAY['Air Conditioning', 'WiFi', 'Reclining Seats', 'Onboard Restroom', 'Audio/Video System', 'XXL Luggage Space']
WHERE id = 5;

-- Vehicle 6: Voiture Économique 4 Places → Economy 4-Seater Car
UPDATE vehicles
SET
  name = 'Economy 4-Seater Car',
  description = 'Economic option for budget-conscious travelers. Reliable and comfortable.',
  features = ARRAY['Air Conditioning', 'GPS', 'Economical']
WHERE id = 6;

-- ============================================================
-- Verification Query
-- ============================================================

-- Verify all vehicle data is now in English
-- SELECT id, name, description, features FROM vehicles ORDER BY id;

-- ============================================================
-- Rollback (if needed)
-- ============================================================

-- To rollback to French:
-- UPDATE vehicles SET name = 'Sedan Confortable', description = 'Berline confortable parfaite pour les petits groupes et les couples. Idéale pour les trajets en ville et les routes de montagne.', features = ARRAY['Climatisation', 'WiFi', 'GPS', 'Bluetooth'] WHERE id = 1;
-- UPDATE vehicles SET name = 'SUV Spacieux 7 Places', description = 'SUV spacieux idéal pour les familles et groupes moyens. Grand coffre pour tous vos bagages.', features = ARRAY['Climatisation', 'WiFi', 'GPS', 'Espace Bagages', 'Sièges Cuir'] WHERE id = 2;
-- UPDATE vehicles SET name = 'Mini Bus 12 Places', description = 'Mini-bus confortable pour groupes moyens à grands. Parfait pour les excursions en groupe.', features = ARRAY['Climatisation', 'WiFi', 'Sièges Inclinables', 'Espace Bagages XL', 'USB Charging'] WHERE id = 3;
-- UPDATE vehicles SET name = 'Van de Luxe 8 Places', description = 'Van de luxe avec tout le confort pour voyager en grand style. Idéal pour les groupes VIP.', features = ARRAY['Climatisation', 'WiFi', 'Sièges Cuir Premium', 'Système Audio', 'Toit Panoramique'] WHERE id = 4;
-- UPDATE vehicles SET name = 'Grand Bus 25 Places', description = 'Grand bus de tourisme pour les grands groupes. Confort maximal pour les longs trajets.', features = ARRAY['Climatisation', 'WiFi', 'Sièges Inclinables', 'WC à bord', 'Système Audio/Vidéo', 'Espace Bagages XXL'] WHERE id = 5;
-- UPDATE vehicles SET name = 'Voiture Économique 4 Places', description = 'Option économique pour les voyageurs à budget serré. Fiable et confortable.', features = ARRAY['Climatisation', 'GPS', 'Économique'] WHERE id = 6;
