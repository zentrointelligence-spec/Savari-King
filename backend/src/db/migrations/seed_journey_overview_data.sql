-- ============================================================================
-- Migration: Seed Journey Overview Data
-- Description: Populates duration_days, highlights, and inclusions for all active tours
-- Author: Claude Code
-- Date: 2025-01-07
-- ============================================================================

-- Tour 1: Kanyakumari Sunrise Spectacle
UPDATE tours SET
  duration_days = 4,
  highlights = ARRAY[
    'Witness spectacular sunrise at the confluence of three oceans',
    'Visit the iconic Vivekananda Rock Memorial',
    'Explore the towering Thiruvalluvar Statue',
    'Relax on pristine beaches with golden sands',
    'Experience traditional South Indian coastal cuisine'
  ],
  inclusions = ARRAY[
    '3 nights accommodation in beachfront hotels',
    'Daily breakfast and 2 dinners',
    'Private AC vehicle with professional driver',
    'English-speaking tour guide',
    'All entrance fees and monument tickets',
    'Boat ride to Vivekananda Rock'
  ]
WHERE id = 1;

-- Tour 2: Cochin Backwater Cruise
UPDATE tours SET
  duration_days = 3,
  highlights = ARRAY[
    'Cruise through serene backwaters on traditional houseboat',
    'Explore historic Fort Kochi and colonial architecture',
    'Watch traditional Kathakali dance performance',
    'Visit Chinese fishing nets and spice markets',
    'Enjoy fresh seafood from local catch'
  ],
  inclusions = ARRAY[
    '2 nights in heritage hotel + 1 night houseboat',
    'All meals during houseboat stay',
    'AC transportation for city tours',
    'Cultural show tickets',
    'Guided walking tour of Fort Kochi',
    'Airport transfers'
  ]
WHERE id = 2;

-- Tour 3: Munnar Tea Plantation Trek
UPDATE tours SET
  duration_days = 5,
  highlights = ARRAY[
    'Trek through lush green tea plantations',
    'Visit tea factory and learn processing techniques',
    'Spot rare Nilgiri Tahr at Eravikulam National Park',
    'Explore Mattupetty Dam and Echo Point',
    'Experience cool mountain climate and mist-covered hills'
  ],
  inclusions = ARRAY[
    '4 nights in hill resort with valley views',
    'Daily breakfast and dinners',
    'All transportation in private vehicle',
    'National park entry and guide',
    'Tea plantation tour with tasting',
    'Nature walks with expert naturalist'
  ]
WHERE id = 3;

-- Tour 4: Alleppey Houseboat Experience
UPDATE tours SET
  duration_days = 2,
  highlights = ARRAY[
    'Overnight stay on luxurious Kerala houseboat',
    'Cruise through scenic backwater canals',
    'Watch village life along the waterways',
    'Enjoy freshly prepared Kerala meals on board',
    'Sunset views over the backwaters'
  ],
  inclusions = ARRAY[
    '1 night on private AC houseboat',
    'All meals on houseboat (lunch, dinner, breakfast)',
    'Houseboat crew and captain',
    'Life jackets and safety equipment',
    'Fishing equipment available',
    'Transfers to/from houseboat'
  ]
WHERE id = 4;

-- Tour 5: Thekkady Wildlife Safari
UPDATE tours SET
  duration_days = 3,
  highlights = ARRAY[
    'Early morning wildlife safari in Periyar Reserve',
    'Bamboo rafting through the jungle',
    'Spice plantation tour with aromatic experiences',
    'Spot elephants, deer, and exotic birds',
    'Traditional tribal village visit'
  ],
  inclusions = ARRAY[
    '2 nights in jungle resort',
    'Breakfast and dinners included',
    'Jeep safari with forest guide',
    'Bamboo raft experience',
    'Spice garden visit',
    'All park entry fees'
  ]
WHERE id = 5;

-- Tour 6: Goa Beach Paradise
UPDATE tours SET
  duration_days = 6,
  highlights = ARRAY[
    'Relax on pristine beaches with water sports',
    'Explore Portuguese heritage in Old Goa',
    'Visit famous churches and cathedrals',
    'Experience vibrant nightlife and beach shacks',
    'Enjoy Goan cuisine and seafood delicacies'
  ],
  inclusions = ARRAY[
    '5 nights beachfront accommodation',
    'Daily breakfast',
    'Airport transfers',
    'Half-day city tour',
    'Water sports activities',
    'Sunset cruise'
  ]
WHERE id = 6;

-- Tour 77: Kerala Backwaters & Spice Gardens
UPDATE tours SET
  duration_days = 4,
  highlights = ARRAY[
    'Houseboat cruise through Kerala backwaters',
    'Walk through aromatic spice plantations',
    'Ayurvedic spa and wellness treatments',
    'Traditional Kerala cooking class',
    'Bird watching in wetlands'
  ],
  inclusions = ARRAY[
    '3 nights accommodation (hotel + houseboat)',
    'All meals during houseboat',
    'Spice plantation guided tour',
    'Ayurvedic massage session',
    'Cooking class with chef',
    'Private transportation'
  ]
WHERE id = 77;

-- Tour 78: Mysore Palace & Hampi Heritage
UPDATE tours SET
  duration_days = 5,
  highlights = ARRAY[
    'Marvel at the illuminated Mysore Palace',
    'Explore ancient ruins of Hampi UNESCO site',
    'Visit Chamundi Hills temple',
    'Witness stone chariot and Virupaksha Temple',
    'Shop for silk and sandalwood in Mysore'
  ],
  inclusions = ARRAY[
    '4 nights in heritage hotels',
    'Daily breakfast and 2 dinners',
    'Private AC vehicle',
    'Professional guide at Hampi',
    'All monument entrance fees',
    'Palace illumination visit'
  ]
WHERE id = 78;

-- Tour 79: Tamil Nadu Temple Trail
UPDATE tours SET
  duration_days = 6,
  highlights = ARRAY[
    'Visit ancient Dravidian temples',
    'Explore Meenakshi Temple in Madurai',
    'Witness evening aarti ceremonies',
    'Discover Chettinad architecture',
    'Experience traditional temple festivals'
  ],
  inclusions = ARRAY[
    '5 nights in heritage mansions',
    'Vegetarian meals included',
    'Temple guide with historical insights',
    'AC transportation',
    'Festival participation (if timing)',
    'Cultural evening programs'
  ]
WHERE id = 79;

-- Tour 80: Hyderabad Heritage & Cuisine
UPDATE tours SET
  duration_days = 3,
  highlights = ARRAY[
    'Visit majestic Charminar and Golconda Fort',
    'Explore Nizam palaces and museums',
    'Taste authentic Hyderabadi biryani',
    'Shop for pearls and bangles',
    'Sound and light show at fort'
  ],
  inclusions = ARRAY[
    '2 nights luxury hotel',
    'Breakfast and biryani dinner',
    'City tour with guide',
    'Fort entry tickets',
    'Evening light show',
    'Airport transfers'
  ]
WHERE id = 80;

-- Tour 81: Goa Beach & Portuguese Heritage
UPDATE tours SET
  duration_days = 4,
  highlights = ARRAY[
    'Beach hopping along North and South Goa',
    'Portuguese fort and church tours',
    'Water sports and dolphin watching',
    'Spice plantation visit',
    'Sunset cruise on Mandovi River'
  ],
  inclusions = ARRAY[
    '3 nights beach resort',
    'Daily breakfast',
    'Heritage walking tour',
    'Water sports package',
    'River cruise with entertainment',
    'Spice farm lunch'
  ]
WHERE id = 81;

-- Tour 177: Goa Beach Paradise
UPDATE tours SET
  duration_days = 5,
  highlights = ARRAY[
    'Multiple beach experiences (Calangute, Baga, Anjuna)',
    'Party atmosphere and beach shacks',
    'Watersports adventure package',
    'Night markets and shopping',
    'Casino experience (optional)'
  ],
  inclusions = ARRAY[
    '4 nights beachfront stay',
    'Breakfast included',
    'Watersports activities',
    'Beach shack vouchers',
    'Club entry passes',
    'Airport pickup/drop'
  ]
WHERE id = 177;

-- Tour 178: Kerala Backwaters Cruise
UPDATE tours SET
  duration_days = 3,
  highlights = ARRAY[
    'Luxury houseboat with modern amenities',
    'Canoe rides through narrow canals',
    'Village walks and local interactions',
    'Traditional Kerala meals onboard',
    'Sunrise and sunset over backwaters'
  ],
  inclusions = ARRAY[
    '2 nights premium houseboat',
    'All meals onboard',
    'Canoe and kayak access',
    'Fishing equipment',
    'Houseboat crew',
    'Transfers included'
  ]
WHERE id = 178;

-- Tour 179: Mysore Palace Cultural Tour
UPDATE tours SET
  duration_days = 2,
  highlights = ARRAY[
    'Guided tour of Mysore Palace',
    'Chamundi Hills temple visit',
    'Brindavan Gardens musical fountain',
    'St. Philomena Cathedral',
    'Local market shopping'
  ],
  inclusions = ARRAY[
    '1 night hotel stay',
    'Breakfast and dinner',
    'Private car with driver',
    'All entrance tickets',
    'Cultural guide',
    'Garden light show'
  ]
WHERE id = 179;

-- Tour 180: Bandipur Wildlife Safari
UPDATE tours SET
  duration_days = 3,
  highlights = ARRAY[
    'Multiple game drives in Bandipur National Park',
    'Elephant, tiger, and leopard spotting',
    'Bird watching sessions',
    'Jungle trekking with naturalist',
    'Campfire under the stars'
  ],
  inclusions = ARRAY[
    '2 nights jungle resort',
    'All meals included',
    '2 jeep safaris',
    'Nature walks with guide',
    'Binoculars provided',
    'Park entry fees'
  ]
WHERE id = 180;

-- Tour 181: Ooty Hill Station Retreat
UPDATE tours SET
  duration_days = 4,
  highlights = ARRAY[
    'Toy train ride through Nilgiri mountains',
    'Botanical gardens and rose garden',
    'Ooty Lake boating',
    'Tea estate visits',
    'Doddabetta Peak viewpoint'
  ],
  inclusions = ARRAY[
    '3 nights hilltop resort',
    'Daily breakfast',
    'Toy train tickets',
    'Lake boating',
    'Garden entry fees',
    'Tea factory tour'
  ]
WHERE id = 181;

-- Tour 182: Budget Beach Getaway
UPDATE tours SET
  duration_days = 3,
  highlights = ARRAY[
    'Affordable beach access',
    'Basic watersports',
    'Local seafood dining',
    'Beach volleyball and games',
    'Sunset viewing points'
  ],
  inclusions = ARRAY[
    '2 nights beach hut accommodation',
    'Breakfast included',
    'Basic beach activities',
    'Shared transportation',
    'Beach bonfire',
    'Local guide tips'
  ]
WHERE id = 182;

-- Tour 183: Luxury Beachfront Resort Experience
UPDATE tours SET
  duration_days = 7,
  highlights = ARRAY[
    'Ultra-luxury 5-star resort stay',
    'Private beach with butler service',
    'Spa and wellness treatments',
    'Gourmet dining experiences',
    'Exclusive yacht excursion'
  ],
  inclusions = ARRAY[
    '6 nights luxury suite',
    'All meals and premium drinks',
    'Spa treatments',
    'Private butler',
    'Yacht charter',
    'Helicopter transfer (optional)'
  ]
WHERE id = 183;

-- Tour 184: Munnar Tea Gardens Tour
UPDATE tours SET
  duration_days = 3,
  highlights = ARRAY[
    'Tea plantation walks',
    'Tea tasting sessions',
    'Eravikulam National Park',
    'Attukal Waterfalls',
    'Photo Point valley views'
  ],
  inclusions = ARRAY[
    '2 nights tea estate bungalow',
    'Breakfast and dinners',
    'Plantation tours',
    'Tea tasting',
    'National park entry',
    'Transportation included'
  ]
WHERE id = 184;

-- Verification query
SELECT
  id,
  name,
  duration_days,
  array_length(highlights, 1) as highlights_count,
  array_length(inclusions, 1) as inclusions_count
FROM tours
WHERE is_active = true
ORDER BY id;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Journey Overview data seeded successfully!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Updated 19 active tours with:';
  RAISE NOTICE '  - Duration (days)';
  RAISE NOTICE '  - Highlights (4-6 per tour)';
  RAISE NOTICE '  - Inclusions (5-7 per tour)';
  RAISE NOTICE '';
  RAISE NOTICE 'All data is now ready for dynamic Journey Overview section!';
  RAISE NOTICE '============================================================================';
END $$;
