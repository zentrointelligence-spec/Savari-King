-- Migration: Add tier-specific inclusions and exclusions for all package tiers
-- This replaces the generic tour-level inclusions with tier-specific ones

-- First, let's add an exclusions_summary column to packagetiers if it doesn't exist
ALTER TABLE packagetiers
ADD COLUMN IF NOT EXISTS exclusions_summary TEXT[];

-- Tour 1: Kanyakumari Sunrise Spectacle
UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '2 nights in 3-star beachfront hotel',
    'Daily breakfast',
    'Shared AC vehicle transportation',
    'English-speaking group guide',
    'Basic entrance fees',
    'Boat ride to Vivekananda Rock'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Lunch and dinner meals',
    'Travel insurance',
    'Personal expenses',
    'Tips and gratuities',
    'Optional activities'
  ]
WHERE tour_id = 1 AND tier_name = 'Standard';

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '3 nights in 4-star beach resort',
    'All meals (breakfast, lunch, dinner)',
    'Private AC vehicle with driver',
    'English-speaking private guide',
    'All entrance fees and monument tickets',
    'Boat ride to Vivekananda Rock',
    'Sunset beach tour',
    'Welcome drink on arrival'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Travel insurance',
    'Personal expenses',
    'Tips and gratuities',
    'Premium alcoholic beverages'
  ]
WHERE tour_id = 1 AND tier_name = 'Premium';

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '3 nights in 5-star luxury beach resort',
    'All gourmet meals with chef specials',
    'Luxury private vehicle with chauffeur',
    'Dedicated personal guide',
    'VIP entrance to all monuments',
    'Private boat charter to Vivekananda Rock',
    'Sunset yacht cruise with champagne',
    'Spa treatment session',
    'Airport meet & greet service',
    'Complimentary room upgrade'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Travel insurance',
    'Personal shopping expenses'
  ]
WHERE tour_id = 1 AND tier_name = 'Luxury';

-- Tour 2: Cochin Backwater Cruise
UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '2 nights in 3-star hotel',
    'Daily breakfast',
    'Shared backwater cruise (4 hours)',
    'Group guided Fort Kochi tour',
    'Basic entrance fees',
    'Kathakali dance show (standard seats)'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Lunch and dinner',
    'Travel insurance',
    'Personal expenses',
    'Tips and gratuities',
    'Shopping expenses'
  ]
WHERE tour_id = 2 AND tier_name = 'Standard';

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '3 nights in 4-star heritage hotel',
    'All meals included',
    'Private houseboat cruise (full day)',
    'Private guided tours',
    'All entrance fees',
    'Kathakali dance show (VIP seats)',
    'Chinese fishing net experience',
    'Spice market guided tour'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Travel insurance',
    'Personal expenses',
    'Tips and gratuities',
    'Alcoholic beverages'
  ]
WHERE tour_id = 2 AND tier_name = 'Premium';

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '3 nights in 5-star waterfront resort',
    'All gourmet meals with seafood specials',
    'Luxury private houseboat with chef',
    'Personal concierge and guide',
    'VIP cultural performances',
    'Sunset cruise with live music',
    'Ayurvedic spa treatments',
    'Private cooking class with chef',
    'Airport luxury transfers'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Travel insurance',
    'Personal shopping'
  ]
WHERE tour_id = 2 AND tier_name = 'Luxury';

-- Tour 3: Munnar Tea Plantation Trek
UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '2 nights in 3-star hillside hotel',
    'Daily breakfast',
    'Shared vehicle transfers',
    'Group tea plantation tour',
    'Basic trekking guide',
    'Tea factory visit'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Lunch and dinner',
    'Travel insurance',
    'Personal expenses',
    'Trekking equipment rental',
    'Tips and gratuities'
  ]
WHERE tour_id = 3 AND tier_name = 'Standard';

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '3 nights in 4-star hill resort',
    'All meals with local cuisine',
    'Private vehicle with driver',
    'Expert tea plantation guide',
    'Tea tasting sessions',
    'Nature trek with packed lunch',
    'Visit to Echo Point',
    'Mattupetty Dam excursion'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Travel insurance',
    'Personal expenses',
    'Tips and gratuities',
    'Adventure sports activities'
  ]
WHERE tour_id = 3 AND tier_name = 'Premium';

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '3 nights in 5-star luxury tea estate resort',
    'Gourmet meals with wine pairing',
    'Luxury private vehicle',
    'Personal trekking guide and naturalist',
    'Exclusive tea estate tour with owner',
    'Premium tea collection gift pack',
    'Helicopter tour of hills',
    'Spa treatments with herbal oils',
    'Private bonfire dinner'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Travel insurance',
    'Personal shopping'
  ]
WHERE tour_id = 3 AND tier_name = 'Luxury';

-- Tour 4: Alleppey Houseboat Experience
UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '1 night on standard houseboat',
    'All meals (traditional Kerala food)',
    'Basic houseboat amenities',
    'Boat crew services',
    'Village visit'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Hotel accommodation',
    'Travel insurance',
    'Personal expenses',
    'Alcoholic beverages',
    'Tips for crew'
  ]
WHERE tour_id = 4 AND tier_name = 'Standard';

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '1 night on deluxe houseboat',
    'All gourmet Kerala meals',
    'AC bedrooms with attached bath',
    'Entertainment system',
    'Village and temple tours',
    'Sunset cruise',
    'Traditional Kerala massage'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Hotel accommodation',
    'Travel insurance',
    'Personal expenses',
    'Premium alcoholic drinks'
  ]
WHERE tour_id = 4 AND tier_name = 'Premium';

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '1 night on luxury private houseboat',
    'Chef-prepared gourmet meals',
    'Luxury AC suites with jacuzzi',
    'Personal butler service',
    'Entertainment and WiFi',
    'Private village cultural tour',
    'Champagne sunset cruise',
    'Full body Ayurvedic spa treatment',
    'Photography session'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Hotel accommodation',
    'Travel insurance',
    'Personal shopping'
  ]
WHERE tour_id = 4 AND tier_name = 'Luxury';

-- Tour 5: Thekkady Wildlife Safari
UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '2 nights in 3-star jungle hotel',
    'Daily breakfast',
    'Shared jeep safari (morning)',
    'Periyar boat cruise',
    'Basic spice plantation visit'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Lunch and dinner',
    'Travel insurance',
    'Personal expenses',
    'Bamboo rafting',
    'Tips and gratuities'
  ]
WHERE tour_id = 5 AND tier_name = 'Standard';

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '3 nights in 4-star wildlife resort',
    'All meals included',
    'Private jeep safari (2 sessions)',
    'Periyar boat cruise (premium)',
    'Guided spice plantation tour',
    'Bamboo rafting experience',
    'Tribal village visit',
    'Nature walk with naturalist'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Travel insurance',
    'Personal expenses',
    'Tips and gratuities',
    'Optional adventure activities'
  ]
WHERE tour_id = 5 AND tier_name = 'Premium';

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '3 nights in 5-star luxury jungle resort',
    'Gourmet meals with organic ingredients',
    'Private luxury safari vehicle',
    'Expert wildlife photographer guide',
    'Exclusive dawn and dusk safaris',
    'Private boat on Periyar Lake',
    'Elephant encounter experience',
    'Spa treatments with jungle herbs',
    'Helicopter transfer option',
    'Professional photography service'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Travel insurance',
    'Personal shopping'
  ]
WHERE tour_id = 5 AND tier_name = 'Luxury';

-- Tour 6: Goa Beach Paradise
UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '4 nights in 3-star beach hotel',
    'Daily breakfast',
    'Airport shared transfers',
    'Basic water sports (1 activity)',
    'Half-day city tour'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Lunch and dinner',
    'Travel insurance',
    'Personal expenses',
    'Additional water sports',
    'Beach shack expenses',
    'Tips and gratuities'
  ]
WHERE tour_id = 6 AND tier_name = 'Standard';

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '5 nights in 4-star beachfront resort',
    'All meals (buffet style)',
    'Private airport transfers',
    'Water sports package (5 activities)',
    'Sunset cruise with dinner',
    'Old Goa heritage tour',
    'Spice plantation visit',
    'Beach activities and games'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Travel insurance',
    'Personal expenses',
    'Scuba diving',
    'Premium alcoholic drinks'
  ]
WHERE tour_id = 6 AND tier_name = 'Premium';

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '5 nights in 5-star luxury beach resort',
    'All-inclusive gourmet dining',
    'Luxury airport transfers',
    'Unlimited water sports and activities',
    'Private yacht sunset cruise',
    'Scuba diving certification course',
    'Casino night experience',
    'Daily spa treatments',
    'Private beach cabana access',
    'Butler service'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Travel insurance',
    'Personal shopping'
  ]
WHERE tour_id = 6 AND tier_name = 'Luxury';

-- Tour 77: Kerala Backwaters & Spice Gardens - 4 Days
UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '3 nights accommodation (2 hotel + 1 houseboat)',
    'Daily breakfast',
    'Basic houseboat meals',
    'Shared vehicle transfers',
    'Group spice plantation tour',
    'Basic Ayurvedic massage (30 min)'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Lunch and dinner (except houseboat)',
    'Travel insurance',
    'Personal expenses',
    'Tips and gratuities',
    'Optional activities'
  ]
WHERE tour_id = 77 AND tier_name = 'Standard';

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '3 nights premium accommodation (2 resort + 1 deluxe houseboat)',
    'All meals included',
    'Deluxe houseboat with AC',
    'Private vehicle with driver',
    'Guided spice plantation tour with lunch',
    'Ayurvedic massage session (60 min)',
    'Cooking class with chef',
    'Village bicycle tour'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Travel insurance',
    'Personal expenses',
    'Tips and gratuities',
    'Alcoholic beverages'
  ]
WHERE tour_id = 77 AND tier_name = 'Premium';

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '3 nights luxury accommodation (2 resort + 1 luxury houseboat)',
    'All gourmet meals with chef specials',
    'Luxury private houseboat with jacuzzi',
    'Private luxury vehicle',
    'Exclusive spice plantation with organic farm lunch',
    'Full Ayurvedic spa package (3 treatments)',
    'Private cooking masterclass',
    'Yoga and meditation sessions',
    'Photography service',
    'Airport meet and greet'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Travel insurance',
    'Personal shopping'
  ]
WHERE tour_id = 77 AND tier_name = 'Luxury';

-- Tour 78: Mysore Palace & Hampi Heritage - 5 Days
UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '4 nights in 3-star hotels',
    'Daily breakfast',
    'Shared vehicle transfers',
    'Group guided tours',
    'Basic entrance fees',
    'Mysore Palace visit'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Lunch and dinner',
    'Travel insurance',
    'Personal expenses',
    'Optional activities',
    'Tips and gratuities'
  ]
WHERE tour_id = 78 AND tier_name = 'Standard';

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '4 nights in 4-star heritage hotels',
    'All meals included',
    'Private AC vehicle',
    'Expert heritage guide',
    'All entrance and monument fees',
    'Mysore Palace illuminated tour',
    'Hampi sunrise visit',
    'Traditional cultural performance'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Travel insurance',
    'Personal expenses',
    'Tips and gratuities',
    'Photography fees at monuments'
  ]
WHERE tour_id = 78 AND tier_name = 'Premium';

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '4 nights in 5-star palace hotels',
    'Gourmet meals with royal cuisine',
    'Luxury private vehicle',
    'Personal historian guide',
    'VIP access to all monuments',
    'Private evening Mysore Palace tour',
    'Helicopter tour of Hampi',
    'Royal dinner at palace',
    'Spa treatments',
    'Photography with costumes'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Travel insurance',
    'Personal shopping'
  ]
WHERE tour_id = 78 AND tier_name = 'Luxury';

-- Tour 79: Tamil Nadu Temple Trail - 6 Days
UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '5 nights in 3-star hotels',
    'Daily breakfast',
    'Shared vehicle',
    'Group temple tours',
    'Basic entrance fees',
    'Temple priest blessings'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Lunch and dinner',
    'Travel insurance',
    'Personal expenses',
    'Donation to temples',
    'Tips and gratuities'
  ]
WHERE tour_id = 79 AND tier_name = 'Standard';

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '5 nights in 4-star hotels',
    'All meals with South Indian cuisine',
    'Private AC vehicle',
    'Expert temple guide',
    'All entrance fees',
    'Special temple darshan access',
    'Classical dance performance',
    'Silk weaving village visit'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Travel insurance',
    'Personal expenses',
    'Tips and gratuities',
    'Personal offerings at temples'
  ]
WHERE tour_id = 79 AND tier_name = 'Premium';

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '5 nights in 5-star heritage hotels',
    'Gourmet vegetarian meals',
    'Luxury private vehicle',
    'Personal spiritual guide',
    'VIP darshan at all temples',
    'Private pooja ceremonies',
    'Classical music concert',
    'Ayurvedic wellness treatments',
    'Traditional silk saree gift',
    'Spiritual consultation'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Travel insurance',
    'Personal shopping'
  ]
WHERE tour_id = 79 AND tier_name = 'Luxury';

-- Tour 80: Hyderabad Heritage & Cuisine - 3 Days
UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '2 nights in 3-star city hotel',
    'Daily breakfast',
    'Shared city tours',
    'Charminar visit',
    'Basic biryani tasting',
    'Golconda Fort visit'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Lunch and dinner',
    'Travel insurance',
    'Personal expenses',
    'Shopping at bazaars',
    'Tips and gratuities'
  ]
WHERE tour_id = 80 AND tier_name = 'Standard';

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '2 nights in 4-star heritage hotel',
    'All meals with Hyderabadi specials',
    'Private vehicle tours',
    'Heritage guide',
    'Food walking tour',
    'Charminar and Chowmahalla Palace',
    'Pearl market visit',
    'Cooking class (biryani)'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Travel insurance',
    'Personal expenses',
    'Tips and gratuities',
    'Shopping expenses'
  ]
WHERE tour_id = 80 AND tier_name = 'Premium';

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '2 nights in 5-star palace hotel',
    'Gourmet Nizami cuisine',
    'Luxury private vehicle',
    'Personal heritage expert',
    'VIP access to monuments',
    'Private royal dinner at palace',
    'Exclusive jewelry shopping tour',
    'Spa with traditional treatments',
    'Meet with local historian',
    'Customized pearl jewelry piece'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Travel insurance',
    'Personal shopping'
  ]
WHERE tour_id = 80 AND tier_name = 'Luxury';

-- Tour 81: Goa Beach & Portuguese Heritage - 4 Days
UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '3 nights in 3-star beach hotel',
    'Daily breakfast',
    'Shared heritage walking tour',
    'Basic water sports (2 activities)',
    'Spice farm visit'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Lunch and dinner',
    'Travel insurance',
    'Personal expenses',
    'Additional water sports',
    'Tips and gratuities'
  ]
WHERE tour_id = 81 AND tier_name = 'Standard';

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '3 nights in 4-star beach resort',
    'All meals included',
    'Private heritage tour',
    'Water sports package (5 activities)',
    'River cruise with entertainment',
    'Spice farm with traditional lunch',
    'Old Goa churches tour',
    'Beach bonfire dinner'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Travel insurance',
    'Personal expenses',
    'Tips and gratuities',
    'Scuba diving'
  ]
WHERE tour_id = 81 AND tier_name = 'Premium';

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    '3 nights in 5-star luxury beach villa',
    'All-inclusive gourmet dining',
    'Private yacht cruise',
    'Unlimited water sports',
    'Scuba diving experience',
    'Private heritage tour with historian',
    'Luxury spa treatments',
    'Private beach dinner setup',
    'Butler service',
    'Photography session'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Travel insurance',
    'Personal shopping'
  ]
WHERE tour_id = 81 AND tier_name = 'Luxury';

-- For all remaining tours (if any), set default tier-based inclusions
UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    'Accommodation as per tier',
    'Daily breakfast',
    'Basic transportation',
    'Standard guided tours',
    'Essential entrance fees'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Most meals',
    'Travel insurance',
    'Personal expenses',
    'Tips and gratuities'
  ]
WHERE tier_name = 'Standard' AND inclusions_summary IS NULL;

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    'Premium accommodation',
    'All meals included',
    'Private vehicle with driver',
    'Expert guided tours',
    'All entrance fees',
    'Special experiences'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Travel insurance',
    'Personal expenses',
    'Tips and gratuities'
  ]
WHERE tier_name = 'Premium' AND inclusions_summary IS NULL;

UPDATE packagetiers SET
  inclusions_summary = ARRAY[
    'Luxury accommodation',
    'Gourmet dining experiences',
    'Luxury private vehicle',
    'Personal guide and concierge',
    'VIP access and experiences',
    'Spa and wellness treatments',
    'Exclusive activities'
  ],
  exclusions_summary = ARRAY[
    'International flights',
    'Travel insurance',
    'Personal shopping'
  ]
WHERE tier_name = 'Luxury' AND inclusions_summary IS NULL;
