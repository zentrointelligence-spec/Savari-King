-- ============================================================================
-- Migration: Seed Accommodations for Remaining Tours
-- Description: Creates package tiers and accommodation data for tours 77-184
-- Author: Claude Code
-- Date: 2025-01-07
-- ============================================================================

-- Function to create package tiers for a tour
CREATE OR REPLACE FUNCTION create_package_tiers_for_tour(
  p_tour_id INTEGER,
  p_base_price NUMERIC
) RETURNS VOID AS $$
BEGIN
  -- Standard tier (base price)
  INSERT INTO packagetiers (tour_id, tier_name, price, hotel_type)
  VALUES (p_tour_id, 'Standard', p_base_price, '3-Star Hotel');

  -- Premium tier (base price + 50%)
  INSERT INTO packagetiers (tour_id, tier_name, price, hotel_type)
  VALUES (p_tour_id, 'Premium', p_base_price * 1.5, '4-Star Resort');

  -- Luxury tier (base price + 120%)
  INSERT INTO packagetiers (tour_id, tier_name, price, hotel_type)
  VALUES (p_tour_id, 'Luxury', p_base_price * 2.2, '5-Star Resort');
END;
$$ LANGUAGE plpgsql;

-- Create package tiers for tours without them
DO $$
DECLARE
  tour_rec RECORD;
BEGIN
  FOR tour_rec IN
    SELECT id, original_price
    FROM tours
    WHERE is_active = true
    AND id NOT IN (SELECT DISTINCT tour_id FROM packagetiers)
  LOOP
    PERFORM create_package_tiers_for_tour(tour_rec.id, tour_rec.original_price);
  END LOOP;
END $$;

-- Now seed accommodations for Tour 77: Kerala Backwaters & Spice Gardens
UPDATE packagetiers SET
  accommodation_name = 'Spice Garden Homestay',
  accommodation_image_url = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080',
  accommodation_description = 'Authentic homestay nestled in aromatic spice plantations with backwater views and traditional Kerala hospitality.',
  accommodation_rating = 3.9,
  accommodation_tags = ARRAY['Spice Garden', 'Backwater View', 'Traditional Cuisine', 'Nature Walks']
WHERE tour_id = 77 AND tier_name = 'Standard';

UPDATE packagetiers SET
  accommodation_name = 'Backwater Heritage Resort',
  accommodation_image_url = 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070',
  accommodation_description = 'Premium resort combining heritage architecture with modern comforts, surrounded by lush spice gardens and serene backwaters.',
  accommodation_rating = 4.5,
  accommodation_tags = ARRAY['Heritage Property', 'Spice Plantation', 'Ayurvedic Spa', 'Pool', 'Canoeing']
WHERE tour_id = 77 AND tier_name = 'Premium';

UPDATE packagetiers SET
  accommodation_name = 'Spice Village Luxury Resort',
  accommodation_image_url = 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1949',
  accommodation_description = 'Exclusive eco-luxury resort with private cottages, organic spice gardens, gourmet dining, and personalized wellness experiences.',
  accommodation_rating = 4.9,
  accommodation_tags = ARRAY['Eco-Luxury', 'Private Cottages', 'Organic Spa', 'Fine Dining', 'Bird Watching']
WHERE tour_id = 77 AND tier_name = 'Luxury';

-- Tour 78: Mysore Palace & Hampi Heritage
UPDATE packagetiers SET
  accommodation_name = 'Heritage Inn Mysore',
  accommodation_image_url = 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070',
  accommodation_description = 'Budget-friendly heritage hotel near Mysore Palace, offering clean rooms and easy access to major attractions.',
  accommodation_rating = 3.7,
  accommodation_tags = ARRAY['Central Location', 'Palace View', 'Breakfast', 'Travel Assistance']
WHERE tour_id = 78 AND tier_name = 'Standard';

UPDATE packagetiers SET
  accommodation_name = 'Royal Orchid Metropole',
  accommodation_image_url = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070',
  accommodation_description = 'Historic luxury hotel in a restored heritage building with colonial charm, elegant rooms, and fine dining.',
  accommodation_rating = 4.6,
  accommodation_tags = ARRAY['Heritage Hotel', 'Colonial Architecture', 'Fine Dining', 'Garden', 'Pool']
WHERE tour_id = 78 AND tier_name = 'Premium';

UPDATE packagetiers SET
  accommodation_name = 'Lalitha Mahal Palace Hotel',
  accommodation_image_url = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070',
  accommodation_description = 'Magnificent palace converted into a luxury hotel, featuring opulent rooms, royal treatment, and breathtaking architecture.',
  accommodation_rating = 4.8,
  accommodation_tags = ARRAY['Royal Palace', 'Luxury Suites', 'Butler Service', 'Palace Gardens', 'Heritage Dining']
WHERE tour_id = 78 AND tier_name = 'Luxury';

-- Tour 79: Tamil Nadu Temple Trail
UPDATE packagetiers SET
  accommodation_name = 'Temple View Lodge',
  accommodation_image_url = 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070',
  accommodation_description = 'Simple and clean accommodation near major temples, perfect for pilgrims and budget travelers.',
  accommodation_rating = 3.6,
  accommodation_tags = ARRAY['Temple Proximity', 'Vegetarian Meals', 'Prayer Room', 'Early Checkout']
WHERE tour_id = 79 AND tier_name = 'Standard';

UPDATE packagetiers SET
  accommodation_name = 'Heritage Chettinad Mansion',
  accommodation_image_url = 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1925',
  accommodation_description = 'Restored Chettinad mansion showcasing traditional Tamil architecture with modern amenities and authentic cuisine.',
  accommodation_rating = 4.4,
  accommodation_tags = ARRAY['Heritage Mansion', 'Traditional Architecture', 'Cultural Experience', 'Authentic Cuisine', 'Courtyard']
WHERE tour_id = 79 AND tier_name = 'Premium';

UPDATE packagetiers SET
  accommodation_name = 'Taj Gateway Hotel Madurai',
  accommodation_image_url = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070',
  accommodation_description = 'Luxury hotel blending Tamil tradition with contemporary elegance, featuring pool, spa, and rooftop dining.',
  accommodation_rating = 4.7,
  accommodation_tags = ARRAY['Luxury Hotel', 'Rooftop Restaurant', 'Spa', 'Pool', 'Temple Tours']
WHERE tour_id = 79 AND tier_name = 'Luxury';

-- Tour 80: Hyderabad Heritage & Cuisine
UPDATE packagetiers SET
  accommodation_name = 'Old City Heritage Hotel',
  accommodation_image_url = 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070',
  accommodation_description = 'Budget hotel in the historic old city, walking distance to Charminar and famous biryani restaurants.',
  accommodation_rating = 3.8,
  accommodation_tags = ARRAY['Old City', 'Central Location', 'Local Cuisine', 'Heritage Sites']
WHERE tour_id = 80 AND tier_name = 'Standard';

UPDATE packagetiers SET
  accommodation_name = 'Taj Falaknuma Palace',
  accommodation_image_url = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070',
  accommodation_description = 'Former Nizam palace transformed into luxury hotel with stunning city views and royal hospitality.',
  accommodation_rating = 4.8,
  accommodation_tags = ARRAY['Palace Hotel', 'City View', 'Royal Experience', 'Fine Dining', 'Heritage Tour']
WHERE tour_id = 80 AND tier_name = 'Premium';

UPDATE packagetiers SET
  accommodation_name = 'Park Hyatt Hyderabad',
  accommodation_image_url = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070',
  accommodation_description = 'Ultra-luxury urban resort with contemporary design, world-class spa, and acclaimed restaurants.',
  accommodation_rating = 4.9,
  accommodation_tags = ARRAY['Urban Resort', 'Spa', 'Fine Dining', 'Infinity Pool', 'Luxury Shopping']
WHERE tour_id = 80 AND tier_name = 'Luxury';

-- Tour 81: Goa Beach & Portuguese Heritage
UPDATE packagetiers SET
  accommodation_name = 'Beach Shack Resort',
  accommodation_image_url = 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070',
  accommodation_description = 'Cozy beachfront resort with direct beach access, water sports, and vibrant Goan nightlife.',
  accommodation_rating = 3.9,
  accommodation_tags = ARRAY['Beach Access', 'Water Sports', 'Nightlife', 'Seafood Restaurant']
WHERE tour_id = 81 AND tier_name = 'Standard';

UPDATE packagetiers SET
  accommodation_name = 'Portuguese Heritage Villa',
  accommodation_image_url = 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070',
  accommodation_description = 'Charming boutique hotel in restored Portuguese villa with colonial architecture and modern comforts.',
  accommodation_rating = 4.6,
  accommodation_tags = ARRAY['Heritage Villa', 'Portuguese Architecture', 'Pool', 'Gourmet Restaurant', 'Beach Nearby']
WHERE tour_id = 81 AND tier_name = 'Premium';

UPDATE packagetiers SET
  accommodation_name = 'Taj Exotica Goa',
  accommodation_image_url = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070',
  accommodation_description = 'Five-star beachfront resort with Mediterranean architecture, private beach, world-class spa, and fine dining.',
  accommodation_rating = 4.9,
  accommodation_tags = ARRAY['Private Beach', 'Luxury Spa', 'Fine Dining', 'Pool Complex', 'Water Sports']
WHERE tour_id = 81 AND tier_name = 'Luxury';

-- Tour 177: Goa Beach Paradise (duplicate, similar to tour 6 and 81)
UPDATE packagetiers SET
  accommodation_name = 'Sunset Beach Resort',
  accommodation_image_url = 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070',
  accommodation_description = 'Affordable beachside resort with stunning sunset views, beach activities, and local seafood.',
  accommodation_rating = 3.8,
  accommodation_tags = ARRAY['Beach View', 'Sunset Point', 'Seafood', 'Water Activities']
WHERE tour_id = 177 AND tier_name = 'Standard';

UPDATE packagetiers SET
  accommodation_name = 'Coastal Paradise Resort',
  accommodation_image_url = 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070',
  accommodation_description = 'Upscale resort with beachfront access, infinity pool, spa services, and international cuisine.',
  accommodation_rating = 4.5,
  accommodation_tags = ARRAY['Beachfront', 'Infinity Pool', 'Spa', 'International Cuisine', 'Beach Bar']
WHERE tour_id = 177 AND tier_name = 'Premium';

UPDATE packagetiers SET
  accommodation_name = 'Grand Hyatt Goa',
  accommodation_image_url = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070',
  accommodation_description = 'Luxury resort featuring lagoon pools, multiple dining venues, spa, and direct beach access.',
  accommodation_rating = 4.8,
  accommodation_tags = ARRAY['Lagoon Pools', 'Multiple Restaurants', 'Luxury Spa', 'Beach Access', 'Casino']
WHERE tour_id = 177 AND tier_name = 'Luxury';

-- Tour 178: Kerala Backwaters Cruise
UPDATE packagetiers SET
  accommodation_name = 'Backwater Inn',
  accommodation_image_url = 'https://images.unsplash.com/photo-1587638540006-f000f9755c61?q=80&w=2070',
  accommodation_description = 'Budget-friendly lakeside inn with backwater views and traditional Kerala meals.',
  accommodation_rating = 3.7,
  accommodation_tags = ARRAY['Lakeside', 'Backwater View', 'Kerala Cuisine', 'Boat Rides']
WHERE tour_id = 178 AND tier_name = 'Standard';

UPDATE packagetiers SET
  accommodation_name = 'Coconut Lagoon Resort',
  accommodation_image_url = 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070',
  accommodation_description = 'Eco-resort accessible only by boat, featuring heritage bungalows and authentic Kerala experiences.',
  accommodation_rating = 4.7,
  accommodation_tags = ARRAY['Eco-Resort', 'Heritage Bungalows', 'Boat Access', 'Ayurvedic Spa', 'Organic Food']
WHERE tour_id = 178 AND tier_name = 'Premium';

UPDATE packagetiers SET
  accommodation_name = 'Vivanta by Taj Kumarakom',
  accommodation_image_url = 'https://images.unsplash.com/photo-1559508551-44bff1de756b?q=80&w=2070',
  accommodation_description = 'Luxury backwater resort with private villas, ayurvedic spa, and exceptional waterfront dining.',
  accommodation_rating = 4.9,
  accommodation_tags = ARRAY['Private Villas', 'Backwater View', 'Ayurvedic Spa', 'Fine Dining', 'Sunset Cruise']
WHERE tour_id = 178 AND tier_name = 'Luxury';

-- Tour 179: Mysore Palace Cultural Tour
UPDATE packagetiers SET
  accommodation_name = 'Palace View Hotel',
  accommodation_image_url = 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070',
  accommodation_description = 'Simple hotel with views of Mysore Palace, clean rooms, and easy access to cultural sites.',
  accommodation_rating = 3.6,
  accommodation_tags = ARRAY['Palace View', 'Cultural Tours', 'Local Food', 'Central']
WHERE tour_id = 179 AND tier_name = 'Standard';

UPDATE packagetiers SET
  accommodation_name = 'Radisson Blu Plaza Mysore',
  accommodation_image_url = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070',
  accommodation_description = 'Modern hotel with elegant rooms, rooftop pool, spa, and proximity to palace and markets.',
  accommodation_rating = 4.5,
  accommodation_tags = ARRAY['Rooftop Pool', 'Spa', 'City Center', 'Multi-Cuisine', 'Cultural Tours']
WHERE tour_id = 179 AND tier_name = 'Premium';

UPDATE packagetiers SET
  accommodation_name = 'The Windflower Resorts & Spa',
  accommodation_image_url = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070',
  accommodation_description = 'Luxury resort on the outskirts with cottages, spa, yoga pavilion, and personalized cultural tours.',
  accommodation_rating = 4.8,
  accommodation_tags = ARRAY['Luxury Cottages', 'Spa', 'Yoga', 'Cultural Tours', 'Gardens']
WHERE tour_id = 179 AND tier_name = 'Luxury';

-- Tour 180: Bandipur Wildlife Safari
UPDATE packagetiers SET
  accommodation_name = 'Forest Edge Lodge',
  accommodation_image_url = 'https://images.unsplash.com/photo-1586375300773-8384e3e4916f?q=80&w=2074',
  accommodation_description = 'Basic jungle lodge near Bandipur National Park with guided safari arrangements.',
  accommodation_rating = 3.8,
  accommodation_tags = ARRAY['Jungle View', 'Safari Arrangements', 'Nature Trails', 'Campfire']
WHERE tour_id = 180 AND tier_name = 'Standard';

UPDATE packagetiers SET
  accommodation_name = 'Bandipur Safari Lodge',
  accommodation_image_url = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080',
  accommodation_description = 'Comfortable jungle resort with naturalist-led safaris, bird watching, and forest experiences.',
  accommodation_rating = 4.6,
  accommodation_tags = ARRAY['Safari Lodge', 'Naturalist Guides', 'Bird Watching', 'Forest Walks', 'Campfire']
WHERE tour_id = 180 AND tier_name = 'Premium';

UPDATE packagetiers SET
  accommodation_name = 'The Serai Bandipur',
  accommodation_image_url = 'https://images.unsplash.com/photo-1570213489059-0aac6626cade?q=80&w=2071',
  accommodation_description = 'Luxury jungle resort with private pool villas, spa, gourmet dining, and exclusive wildlife experiences.',
  accommodation_rating = 4.9,
  accommodation_tags = ARRAY['Pool Villas', 'Luxury Spa', 'Private Safaris', 'Fine Dining', 'Wildlife Photography']
WHERE tour_id = 180 AND tier_name = 'Luxury';

-- Tour 181: Ooty Hill Station Retreat
UPDATE packagetiers SET
  accommodation_name = 'Hillside Cottage',
  accommodation_image_url = 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?q=80&w=2074',
  accommodation_description = 'Cozy hillside cottage with mountain views, garden, and peaceful atmosphere.',
  accommodation_rating = 3.9,
  accommodation_tags = ARRAY['Mountain View', 'Garden', 'Fireplace', 'Homely']
WHERE tour_id = 181 AND tier_name = 'Standard';

UPDATE packagetiers SET
  accommodation_name = 'Sterling Ooty Elk Hill',
  accommodation_image_url = 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070',
  accommodation_description = 'Premium hill resort with panoramic valley views, restaurant, and adventure activities.',
  accommodation_rating = 4.6,
  accommodation_tags = ARRAY['Valley View', 'Restaurant', 'Adventure Sports', 'Bonfire', 'Tea Estate']
WHERE tour_id = 181 AND tier_name = 'Premium';

UPDATE packagetiers SET
  accommodation_name = 'Taj Savoy Hotel Ooty',
  accommodation_image_url = 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?q=80&w=2074',
  accommodation_description = 'Heritage luxury hotel in colonial building with antique furniture, fine dining, and impeccable service.',
  accommodation_rating = 4.8,
  accommodation_tags = ARRAY['Heritage Hotel', 'Colonial Architecture', 'Fine Dining', 'Gardens', 'Butler Service']
WHERE tour_id = 181 AND tier_name = 'Luxury';

-- Tour 182: Budget Beach Getaway
UPDATE packagetiers SET
  accommodation_name = 'Beach Hut Stay',
  accommodation_image_url = 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070',
  accommodation_description = 'Ultra-budget beach huts with direct beach access, perfect for backpackers and budget travelers.',
  accommodation_rating = 3.5,
  accommodation_tags = ARRAY['Beach Huts', 'Budget', 'Beach Access', 'Backpacker Friendly']
WHERE tour_id = 182 AND tier_name = 'Standard';

UPDATE packagetiers SET
  accommodation_name = 'Coastal Comfort Inn',
  accommodation_image_url = 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070',
  accommodation_description = 'Mid-range beach resort with comfortable rooms, pool, and restaurant.',
  accommodation_rating = 4.2,
  accommodation_tags = ARRAY['Beach View', 'Pool', 'Restaurant', 'Water Sports']
WHERE tour_id = 182 AND tier_name = 'Premium';

UPDATE packagetiers SET
  accommodation_name = 'Beachfront Boutique Hotel',
  accommodation_image_url = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070',
  accommodation_description = 'Boutique beachfront hotel with stylish rooms, infinity pool, and gourmet dining.',
  accommodation_rating = 4.7,
  accommodation_tags = ARRAY['Beachfront', 'Infinity Pool', 'Boutique', 'Gourmet Dining', 'Spa']
WHERE tour_id = 182 AND tier_name = 'Luxury';

-- Tour 183: Luxury Beachfront Resort Experience
UPDATE packagetiers SET
  accommodation_name = 'Premium Beach Resort',
  accommodation_image_url = 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070',
  accommodation_description = 'Upscale beachfront resort with modern amenities, pool, and multiple dining options.',
  accommodation_rating = 4.3,
  accommodation_tags = ARRAY['Beachfront', 'Pool', 'Multiple Restaurants', 'Spa Services']
WHERE tour_id = 183 AND tier_name = 'Standard';

UPDATE packagetiers SET
  accommodation_name = 'Leela Goa Beach Resort',
  accommodation_image_url = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070',
  accommodation_description = 'Five-star resort with private beach, lagoon-style pool, spa, and world-class dining.',
  accommodation_rating = 4.8,
  accommodation_tags = ARRAY['Private Beach', 'Lagoon Pool', 'Luxury Spa', 'Fine Dining', 'Golf Course']
WHERE tour_id = 183 AND tier_name = 'Premium';

UPDATE packagetiers SET
  accommodation_name = 'The Leela Palace Goa',
  accommodation_image_url = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070',
  accommodation_description = 'Ultra-luxury palace resort with royal suites, private butler, Michelin-rated restaurants, and exclusive beach.',
  accommodation_rating = 5.0,
  accommodation_tags = ARRAY['Royal Suites', 'Butler Service', 'Michelin Dining', 'Private Beach', 'Helicopter Pad']
WHERE tour_id = 183 AND tier_name = 'Luxury';

-- Tour 184: Munnar Tea Gardens Tour
UPDATE packagetiers SET
  accommodation_name = 'Tea Estate Cottage',
  accommodation_image_url = 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?q=80&w=2074',
  accommodation_description = 'Simple cottage in tea plantation with garden views and tea tasting experiences.',
  accommodation_rating = 3.8,
  accommodation_tags = ARRAY['Tea Estate', 'Garden View', 'Tea Tasting', 'Nature Walks']
WHERE tour_id = 184 AND tier_name = 'Standard';

UPDATE packagetiers SET
  accommodation_name = 'Windermere Estate',
  accommodation_image_url = 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070',
  accommodation_description = 'Colonial-era plantation bungalow with valley views, tea plantation tours, and traditional Kerala cuisine.',
  accommodation_rating = 4.6,
  accommodation_tags = ARRAY['Plantation Bungalow', 'Valley View', 'Tea Tours', 'Colonial Heritage', 'Trekking']
WHERE tour_id = 184 AND tier_name = 'Premium';

UPDATE packagetiers SET
  accommodation_name = 'Blanket Hotel & Spa',
  accommodation_image_url = 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?q=80&w=2074',
  accommodation_description = 'Luxury boutique hotel in tea gardens with panoramic views, spa, and farm-to-table dining.',
  accommodation_rating = 4.9,
  accommodation_tags = ARRAY['Boutique Luxury', 'Panoramic Views', 'Spa', 'Organic Dining', 'Tea Plantations']
WHERE tour_id = 184 AND tier_name = 'Luxury';

-- Drop the temporary function
DROP FUNCTION IF EXISTS create_package_tiers_for_tour(INTEGER, NUMERIC);

-- Verification query
SELECT
  t.id,
  t.name,
  COUNT(pt.id) as total_tiers,
  COUNT(pt.accommodation_name) as tiers_with_accommodation
FROM tours t
LEFT JOIN packagetiers pt ON t.id = pt.tour_id
WHERE t.is_active = true
GROUP BY t.id, t.name
ORDER BY t.id;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Package tiers and accommodations seeded for all remaining tours!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Completed:';
  RAISE NOTICE '  - Created package tiers for tours without them';
  RAISE NOTICE '  - Added accommodation data for 13 additional tours (77-184)';
  RAISE NOTICE '  - All 19 active tours now have complete accommodation details';
  RAISE NOTICE '';
  RAISE NOTICE 'Total accommodations: 57 (19 tours × 3 tiers each)';
  RAISE NOTICE '============================================================================';
END $$;
