-- ============================================================================
-- Migration: Seed Accommodation Data for PackageTiers
-- Description: Populates accommodation details for existing package tiers
--              with realistic hotel/resort information for South Indian tours
-- Author: Claude Code
-- Date: 2025-01-07
-- ============================================================================

-- Seed accommodation data for Tour 1: Kanyakumari Sunrise Spectacle
UPDATE packagetiers
SET
  accommodation_name = 'Hotel Sea View',
  accommodation_image_url = 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1949',
  accommodation_description = 'Comfortable seaside hotel with stunning sunrise views over the Indian Ocean. Perfect base for exploring Kanyakumari.',
  accommodation_rating = 3.8,
  accommodation_tags = ARRAY['Sea View', 'Restaurant', 'Free WiFi', 'Sunrise View']
WHERE tour_id = 1 AND tier_name = 'Standard';

UPDATE packagetiers
SET
  accommodation_name = 'Sparsa Resort Kanyakumari',
  accommodation_image_url = 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1925',
  accommodation_description = 'Upscale beachfront resort with modern amenities, panoramic ocean views, and traditional Kerala architecture.',
  accommodation_rating = 4.5,
  accommodation_tags = ARRAY['Beach Access', 'Swimming Pool', 'Spa', 'Multi-Cuisine Restaurant', 'Ocean View']
WHERE tour_id = 1 AND tier_name = 'Premium';

UPDATE packagetiers
SET
  accommodation_name = 'The Gopinivas Grand',
  accommodation_image_url = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070',
  accommodation_description = 'Luxury beachfront resort featuring private balconies with panoramic sea views, infinity pool, and world-class dining.',
  accommodation_rating = 4.9,
  accommodation_tags = ARRAY['Private Beach', 'Infinity Pool', 'Ayurvedic Spa', 'Fine Dining', 'Sunset Lounge']
WHERE tour_id = 1 AND tier_name = 'Luxury';

-- Seed accommodation data for Tour 2: Cochin Backwater Cruise
UPDATE packagetiers
SET
  accommodation_name = 'Cochin Heritage Hotel',
  accommodation_image_url = 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070',
  accommodation_description = 'Charming budget hotel in Fort Kochi area, walking distance to historic attractions and waterfront.',
  accommodation_rating = 3.5,
  accommodation_tags = ARRAY['Central Location', 'Heritage Area', 'Breakfast Included', 'Travel Desk']
WHERE tour_id = 2 AND tier_name = 'Standard';

UPDATE packagetiers
SET
  accommodation_name = 'Brunton Boatyard Hotel',
  accommodation_image_url = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070',
  accommodation_description = 'Boutique heritage hotel on the waterfront, blending colonial architecture with modern luxury and harbor views.',
  accommodation_rating = 4.6,
  accommodation_tags = ARRAY['Waterfront', 'Heritage Property', 'Rooftop Restaurant', 'Pool', 'Spa Services']
WHERE tour_id = 2 AND tier_name = 'Premium';

UPDATE packagetiers
SET
  accommodation_name = 'Taj Malabar Resort & Spa',
  accommodation_image_url = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070',
  accommodation_description = 'Five-star luxury resort on Willingdon Island with private marina, rejuvenating spa, and exquisite seafood dining.',
  accommodation_rating = 4.8,
  accommodation_tags = ARRAY['Private Marina', 'Luxury Spa', 'Fine Dining', 'Harbor View', 'Concierge Service']
WHERE tour_id = 2 AND tier_name = 'Luxury';

-- Seed accommodation data for Tour 3: Munnar Tea Plantation Trek
UPDATE packagetiers
SET
  accommodation_name = 'Munnar Hills Cottage',
  accommodation_image_url = 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?q=80&w=2074',
  accommodation_description = 'Cozy hillside cottage surrounded by tea gardens, offering peaceful mountain views and fresh air.',
  accommodation_rating = 3.7,
  accommodation_tags = ARRAY['Mountain View', 'Tea Garden', 'Homely Atmosphere', 'Nature Walks']
WHERE tour_id = 3 AND tier_name = 'Standard';

UPDATE packagetiers
SET
  accommodation_name = 'Sterling Munnar Resort',
  accommodation_image_url = 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070',
  accommodation_description = 'Premium resort nestled in tea plantations with valley views, adventure activities, and multi-cuisine dining.',
  accommodation_rating = 4.4,
  accommodation_tags = ARRAY['Valley View', 'Tea Estate', 'Adventure Sports', 'Bonfire', 'Restaurant']
WHERE tour_id = 3 AND tier_name = 'Premium';

UPDATE packagetiers
SET
  accommodation_name = 'Fragrant Nature Munnar',
  accommodation_image_url = 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?q=80&w=2074',
  accommodation_description = 'Eco-luxury resort with private villas, panoramic mountain views, organic cuisine, and personalized service.',
  accommodation_rating = 4.9,
  accommodation_tags = ARRAY['Private Villas', 'Eco-Friendly', 'Panoramic Views', 'Organic Dining', 'Yoga Sessions']
WHERE tour_id = 3 AND tier_name = 'Luxury';

-- Seed accommodation data for Tour 4: Alleppey Houseboat Experience
UPDATE packagetiers
SET
  accommodation_name = 'Lake Palace Resort',
  accommodation_image_url = 'https://images.unsplash.com/photo-1587638540006-f000f9755c61?q=80&w=2070',
  accommodation_description = 'Lakeside resort with comfortable rooms, backwater views, and traditional Kerala hospitality.',
  accommodation_rating = 3.6,
  accommodation_tags = ARRAY['Lakeside', 'Garden', 'Kerala Cuisine', 'Boating Facility']
WHERE tour_id = 4 AND tier_name = 'Standard';

UPDATE packagetiers
SET
  accommodation_name = 'Premium Backwater Resort',
  accommodation_image_url = 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070',
  accommodation_description = 'Upscale resort on the backwaters featuring private docks, infinity pool, and authentic Kerala cuisine.',
  accommodation_rating = 4.5,
  accommodation_tags = ARRAY['Private Dock', 'Infinity Pool', 'Backwater View', 'Kerala Spa', 'Canoe Rides']
WHERE tour_id = 4 AND tier_name = 'Premium';

UPDATE packagetiers
SET
  accommodation_name = 'Kumarakom Lake Resort',
  accommodation_image_url = 'https://images.unsplash.com/photo-1559508551-44bff1de756b?q=80&w=2070',
  accommodation_description = 'Heritage luxury resort with traditional Kerala villas, ayurvedic spa, and exceptional backwater dining experiences.',
  accommodation_rating = 4.9,
  accommodation_tags = ARRAY['Heritage Villas', 'Ayurvedic Spa', 'Private Pool', 'Gourmet Dining', 'Bird Watching']
WHERE tour_id = 4 AND tier_name = 'Luxury';

-- Seed accommodation data for Tour 5: Thekkady Wildlife Safari
UPDATE packagetiers
SET
  accommodation_name = 'Forest Edge Homestay',
  accommodation_image_url = 'https://images.unsplash.com/photo-1586375300773-8384e3e4916f?q=80&w=2074',
  accommodation_description = 'Simple and comfortable homestay near Periyar Wildlife Sanctuary, perfect for nature enthusiasts.',
  accommodation_rating = 3.8,
  accommodation_tags = ARRAY['Forest View', 'Nature Trails', 'Local Cuisine', 'Wildlife Spotting']
WHERE tour_id = 5 AND tier_name = 'Standard';

UPDATE packagetiers
SET
  accommodation_name = 'Spice Village Resort',
  accommodation_image_url = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080',
  accommodation_description = 'Eco-resort in spice plantations with cottage-style accommodations, nature walks, and organic dining.',
  accommodation_rating = 4.6,
  accommodation_tags = ARRAY['Spice Garden', 'Eco-Resort', 'Nature Walks', 'Organic Food', 'Wildlife Tours']
WHERE tour_id = 5 AND tier_name = 'Premium';

UPDATE packagetiers
SET
  accommodation_name = 'The Elephant Court',
  accommodation_image_url = 'https://images.unsplash.com/photo-1570213489059-0aac6626cade?q=80&w=2071',
  accommodation_description = 'Luxury jungle resort with panoramic forest views, premium spa, and exclusive wildlife experiences.',
  accommodation_rating = 4.8,
  accommodation_tags = ARRAY['Jungle View', 'Luxury Spa', 'Wildlife Experiences', 'Fine Dining', 'Elephant Corridor']
WHERE tour_id = 5 AND tier_name = 'Luxury';

-- Seed accommodation data for Tour 6: Goa Beach Paradise
UPDATE packagetiers
SET
  accommodation_name = 'Goa Beach Hut Resort',
  accommodation_image_url = 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070',
  accommodation_description = 'Budget-friendly beach resort with direct beach access, lively atmosphere, and Goan hospitality.',
  accommodation_rating = 3.9,
  accommodation_tags = ARRAY['Beach Access', 'Beachfront', 'Water Sports', 'Beach Shack', 'Nightlife Nearby']
WHERE tour_id = 6 AND tier_name = 'Standard';

UPDATE packagetiers
SET
  accommodation_name = 'Alila Diwa Goa',
  accommodation_image_url = 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070',
  accommodation_description = 'Contemporary resort in South Goa with paddy field views, infinity pool, and award-winning restaurants.',
  accommodation_rating = 4.7,
  accommodation_tags = ARRAY['Infinity Pool', 'Spa', 'Multiple Restaurants', 'Beach Shuttle', 'Yoga Pavilion']
WHERE tour_id = 6 AND tier_name = 'Premium';

UPDATE packagetiers
SET
  accommodation_name = 'Taj Exotica Resort & Spa',
  accommodation_image_url = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070',
  accommodation_description = 'Five-star luxury beachfront resort with private beach, world-class spa, Mediterranean architecture, and gourmet dining.',
  accommodation_rating = 4.9,
  accommodation_tags = ARRAY['Private Beach', 'Luxury Spa', 'Fine Dining', 'Golf Course', 'Butler Service']
WHERE tour_id = 6 AND tier_name = 'Luxury';

-- Verification query
SELECT
  t.id as tour_id,
  t.name as tour_name,
  pt.tier_name,
  pt.accommodation_name,
  pt.accommodation_rating,
  array_length(pt.accommodation_tags, 1) as tag_count
FROM packagetiers pt
JOIN tours t ON pt.tour_id = t.id
WHERE pt.accommodation_name IS NOT NULL
ORDER BY t.id,
  CASE pt.tier_name
    WHEN 'Standard' THEN 1
    WHEN 'Premium' THEN 2
    WHEN 'Luxury' THEN 3
  END;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Accommodation data seeded successfully!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Seeded accommodations for:';
  RAISE NOTICE '  - Tour 1: Kanyakumari Sunrise Spectacle (3 tiers)';
  RAISE NOTICE '  - Tour 2: Cochin Backwater Cruise (3 tiers)';
  RAISE NOTICE '  - Tour 3: Munnar Tea Plantation Trek (3 tiers)';
  RAISE NOTICE '  - Tour 4: Alleppey Houseboat Experience (3 tiers)';
  RAISE NOTICE '  - Tour 5: Thekkady Wildlife Safari (3 tiers)';
  RAISE NOTICE '  - Tour 6: Goa Beach Paradise (3 tiers)';
  RAISE NOTICE '';
  RAISE NOTICE 'Total: 18 accommodations with realistic data';
  RAISE NOTICE '============================================================================';
END $$;
