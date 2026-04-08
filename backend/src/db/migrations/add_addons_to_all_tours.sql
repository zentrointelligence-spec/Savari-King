-- =====================================================
-- Migration: Add addons to all tours
-- Description: Associate relevant addons to all active tours
-- =====================================================

-- Delete existing associations to start fresh (except tour 6)
DELETE FROM touraddons WHERE tour_id != 6;

-- Tour 1: Kanyakumari Sunrise Spectacle
-- Cultural/spiritual tour - add guide, photography, cultural show
INSERT INTO touraddons (tour_id, addon_id) VALUES
(1, 2), -- Expert Local Guide
(1, 5), -- Professional Photography Session
(1, 7); -- Traditional Cultural Show & Dinner

-- Tour 2: Cochin Backwater Cruise
-- Backwater experience - add spa, guide, dinner
INSERT INTO touraddons (tour_id, addon_id) VALUES
(2, 2), -- Expert Local Guide
(2, 3), -- Premium Ayurvedic Spa Retreat
(2, 1); -- Romantic Candlelight Dinner

-- Tour 3: Munnar Tea Plantation Trek
-- Nature/adventure tour - add guide, yoga, photography
INSERT INTO touraddons (tour_id, addon_id) VALUES
(3, 2), -- Expert Local Guide
(3, 4), -- Sunrise Yoga & Meditation
(3, 5); -- Professional Photography Session

-- Tour 4: Alleppey Houseboat Experience
-- Relaxing houseboat - add spa, yoga, dinner
INSERT INTO touraddons (tour_id, addon_id) VALUES
(4, 1), -- Romantic Candlelight Dinner
(4, 3), -- Premium Ayurvedic Spa Retreat
(4, 4); -- Sunrise Yoga & Meditation

-- Tour 5: Thekkady Wildlife Safari
-- Wildlife/adventure - add guide, photography, cultural
INSERT INTO touraddons (tour_id, addon_id) VALUES
(5, 2), -- Expert Local Guide
(5, 5), -- Professional Photography Session
(5, 7); -- Traditional Cultural Show & Dinner

-- Tour 77: Kerala Backwaters & Spice Gardens - 4 Days
INSERT INTO touraddons (tour_id, addon_id) VALUES
(77, 2), -- Expert Local Guide
(77, 3), -- Premium Ayurvedic Spa Retreat
(77, 4), -- Sunrise Yoga & Meditation
(77, 5); -- Professional Photography Session

-- Tour 78: Mysore Palace & Hampi Heritage - 5 Days
INSERT INTO touraddons (tour_id, addon_id) VALUES
(78, 2), -- Expert Local Guide
(78, 5), -- Professional Photography Session
(78, 7), -- Traditional Cultural Show & Dinner
(78, 8); -- Private Airport Transfer

-- Tour 79: Tamil Nadu Temple Trail - 6 Days
INSERT INTO touraddons (tour_id, addon_id) VALUES
(79, 2), -- Expert Local Guide
(79, 5), -- Professional Photography Session
(79, 7), -- Traditional Cultural Show & Dinner
(79, 8); -- Private Airport Transfer

-- Tour 80: Hyderabad Heritage & Cuisine - 3 Days
INSERT INTO touraddons (tour_id, addon_id) VALUES
(80, 2), -- Expert Local Guide
(80, 5), -- Professional Photography Session
(80, 7), -- Traditional Cultural Show & Dinner
(80, 8); -- Private Airport Transfer

-- Tour 81: Goa Beach & Portuguese Heritage - 4 Days
INSERT INTO touraddons (tour_id, addon_id) VALUES
(81, 1), -- Romantic Candlelight Dinner
(81, 2), -- Expert Local Guide
(81, 3), -- Premium Ayurvedic Spa Retreat
(81, 5), -- Professional Photography Session
(81, 6); -- Water Sports Package

-- Tour 177: Goa Beach Paradise
INSERT INTO touraddons (tour_id, addon_id) VALUES
(177, 1), -- Romantic Candlelight Dinner
(177, 3), -- Premium Ayurvedic Spa Retreat
(177, 4), -- Sunrise Yoga & Meditation
(177, 6); -- Water Sports Package

-- Tour 178: Kerala Backwaters Cruise
INSERT INTO touraddons (tour_id, addon_id) VALUES
(178, 1), -- Romantic Candlelight Dinner
(178, 2), -- Expert Local Guide
(178, 3), -- Premium Ayurvedic Spa Retreat
(178, 4); -- Sunrise Yoga & Meditation

-- Tour 179: Mysore Palace Cultural Tour
INSERT INTO touraddons (tour_id, addon_id) VALUES
(179, 2), -- Expert Local Guide
(179, 5), -- Professional Photography Session
(179, 7), -- Traditional Cultural Show & Dinner
(179, 8); -- Private Airport Transfer

-- Tour 180: Bandipur Wildlife Safari
INSERT INTO touraddons (tour_id, addon_id) VALUES
(180, 2), -- Expert Local Guide
(180, 5), -- Professional Photography Session
(180, 8); -- Private Airport Transfer

-- Tour 181: Ooty Hill Station Retreat
INSERT INTO touraddons (tour_id, addon_id) VALUES
(181, 2), -- Expert Local Guide
(181, 3), -- Premium Ayurvedic Spa Retreat
(181, 4), -- Sunrise Yoga & Meditation
(181, 5); -- Professional Photography Session

-- Tour 182: Budget Beach Getaway
INSERT INTO touraddons (tour_id, addon_id) VALUES
(182, 4), -- Sunrise Yoga & Meditation
(182, 6), -- Water Sports Package
(182, 8); -- Private Airport Transfer

-- Tour 183: Luxury Beachfront Resort Experience
INSERT INTO touraddons (tour_id, addon_id) VALUES
(183, 1), -- Romantic Candlelight Dinner
(183, 2), -- Expert Local Guide
(183, 3), -- Premium Ayurvedic Spa Retreat
(183, 5), -- Professional Photography Session
(183, 6); -- Water Sports Package

-- Tour 184: Munnar Tea Gardens Tour
INSERT INTO touraddons (tour_id, addon_id) VALUES
(184, 2), -- Expert Local Guide
(184, 4), -- Sunrise Yoga & Meditation
(184, 5), -- Professional Photography Session
(184, 8); -- Private Airport Transfer

-- Success message
DO $$
DECLARE
    total_associations INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_associations FROM touraddons;
    RAISE NOTICE 'Successfully added addons to all tours! Total associations: %', total_associations;
END $$;
