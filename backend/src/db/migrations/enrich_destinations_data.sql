-- ======================================================================
-- FILE: enrich_destinations_data.sql
-- Purpose: Enrich existing destinations with detailed information
-- Date: 2025-10-21
-- ======================================================================

-- ======================================================================
-- 1. KERALA (ID: 127) - Gods Own Country
-- ======================================================================
UPDATE destinations SET
  top_attractions = ARRAY[
    'Backwaters of Alleppey',
    'Munnar Tea Gardens',
    'Fort Kochi',
    'Periyar Wildlife Sanctuary',
    'Varkala Beach',
    'Wayanad Hill Station',
    'Kovalam Beach',
    'Athirappilly Waterfalls'
  ],

  activities = ARRAY[
    'Houseboat Cruises',
    'Tea Plantation Tours',
    'Ayurvedic Spa Treatments',
    'Wildlife Safaris',
    'Beach Activities',
    'Kathakali Dance Performances',
    'Backwater Fishing',
    'Spice Plantation Visits',
    'Trekking',
    'Bird Watching'
  ],

  specialties = ARRAY[
    'Kathakali Dance',
    'Ayurveda and Wellness',
    'Spice Plantations',
    'Kerala Cuisine (Sadya)',
    'Traditional Architecture',
    'Coir and Handicrafts',
    'Coconut-based Products'
  ],

  cultural_highlights = ARRAY[
    'Temple Festivals',
    'Snake Boat Races (Vallam Kali)',
    'Traditional Music (Sopana Sangeetham)',
    'Local Handicrafts Markets',
    'Art Forms (Mohiniyattam, Theyyam)'
  ],

  best_time_to_visit = 'October to March - Pleasant weather with cool temperatures, ideal for sightseeing and outdoor activities',
  peak_season = 'December to January',
  off_season = 'June to September (Monsoon season - heavy rainfall)',

  climate_info = 'Kerala has a tropical monsoon climate with heavy rainfall during the monsoon season (June-September). The weather is generally hot and humid throughout the year, with coastal areas being more humid than hill stations.',

  weather_data = '{"summer": {"months": "March to May", "temp_min": 25, "temp_max": 35, "description": "Hot and humid with occasional pre-monsoon showers", "humidity": "70-80%"}, "monsoon": {"months": "June to September", "temp_min": 23, "temp_max": 30, "description": "Heavy rainfall, lush greenery, cooler temperatures", "humidity": "85-95%", "rainfall": "Very High"}, "winter": {"months": "October to February", "temp_min": 20, "temp_max": 30, "description": "Pleasant and comfortable, best time to visit", "humidity": "60-70%"}}'::jsonb,

  festivals_events = '[{"name": "Onam", "month": "August-September", "date": "2025-09-05", "description": "Harvest festival celebrated with boat races, cultural programs, and traditional Sadya feast", "type": "Cultural"}, {"name": "Thrissur Pooram", "month": "April-May", "date": "2025-05-10", "description": "Grand temple festival featuring magnificent elephant procession and fireworks", "type": "Religious"}, {"name": "Nehru Trophy Boat Race", "month": "August", "date": "2025-08-15", "description": "Famous snake boat race held in Alleppey backwaters", "type": "Sports"}, {"name": "Attukal Pongala", "month": "February-March", "date": "2025-03-08", "description": "Worlds largest gathering of women for a religious offering", "type": "Religious"}, {"name": "Vishu", "month": "April", "date": "2025-04-14", "description": "Malayalam New Year celebrated with traditional rituals and feasts", "type": "Cultural"}]'::jsonb,

  recommended_duration = '7-10 days',
  difficulty_level = 'easy',
  adventure_level = 'low',
  family_friendly = true,
  eco_friendly = true,

  travel_tips = 'Dress modestly when visiting temples and religious sites. Try the traditional Kerala Sadya (feast) served on banana leaf. Book houseboats well in advance during peak season (December-January). Carry light cotton clothes, but also pack a light jacket for hill stations. Rain gear is essential during monsoon. Bargain at local markets. Try authentic Ayurvedic treatments from reputable centers.',

  local_customs = 'Remove shoes before entering homes and temples. Dress conservatively, especially at religious sites. Always ask permission before photographing people. The traditional greeting is Namaskaram with palms together. Eating with the right hand is customary. Public displays of affection should be avoided.',

  safety_info = 'Kerala is generally very safe for tourists, including solo female travelers. However, be cautious during monsoon season due to flooding and landslides. Follow safety guidelines during water activities like boating and swimming. Be aware of strong currents at beaches. Store valuables safely. Drink bottled water. Be cautious of monkeys near temples and tourist spots.',

  packing_suggestions = ARRAY[
    'Light cotton clothing for hot weather',
    'Comfortable walking shoes and sandals',
    'Modest clothing for temple visits (long pants, covered shoulders)',
    'Sunscreen (SPF 50+) and sunglasses',
    'Insect repellent and mosquito cream',
    'Rain jacket or umbrella (especially during monsoon)',
    'Light sweater for air-conditioned spaces and hill stations',
    'Hat or cap for sun protection',
    'Reusable water bottle',
    'Basic medications and first-aid kit',
    'Camera for capturing beautiful landscapes',
    'Power bank and adapters'
  ],

  nearest_airport = 'Cochin International Airport (COK), Trivandrum International Airport (TRV), Calicut International Airport (CCJ)',
  nearest_railway = 'Major stations: Ernakulam Junction, Trivandrum Central, Kozhikode',
  local_transport = 'Auto-rickshaws, taxis, local buses, app-based cabs (Uber, Ola), rental cars/bikes available',

  how_to_reach = 'By Air: Well-connected airports at Kochi, Trivandrum, and Calicut with domestic and international flights. By Train: Extensive railway network connecting all major cities. By Road: Well-maintained national and state highways, regular bus services from neighboring states.',

  accommodation_types = ARRAY['Luxury Resorts', 'Houseboats', 'Heritage Hotels', 'Beach Resorts', 'Budget Hotels', 'Homestays', 'Eco-lodges', 'Ayurvedic Retreats'],

  meta_title = 'Kerala Tourism - Gods Own Country | Backwaters, Hill Stations & Beaches',
  meta_description = 'Explore Kerala, Gods Own Country. Experience serene backwaters, lush tea gardens, pristine beaches, and rich cultural heritage. Book your Kerala tour package now!',
  meta_keywords = 'Kerala tourism, Kerala backwaters, Munnar tea gardens, Kerala houseboat, Alleppey, Fort Kochi, Kerala Ayurveda, Gods Own Country',

  updated_at = NOW()
WHERE id = 127;

-- ======================================================================
-- 2. KANYAKUMARI (ID: 1) - Southernmost Tip of India
-- ======================================================================
UPDATE destinations SET
  top_attractions = ARRAY[
    'Vivekananda Rock Memorial',
    'Thiruvalluvar Statue',
    'Kanyakumari Beach',
    'Sunset & Sunrise View Point',
    'Kumari Amman Temple',
    'Gandhi Memorial'
  ],

  activities = ARRAY[
    'Beach Walking',
    'Sunrise & Sunset Viewing',
    'Temple Visits',
    'Ferry Rides',
    'Photography',
    'Local Shopping'
  ],

  specialties = ARRAY[
    'Southernmost tip of India',
    'Confluence of three seas (Arabian Sea, Bay of Bengal, Indian Ocean)',
    'Unique sunrise and sunset views',
    'Pearl fishing',
    'Shell handicrafts'
  ],

  cultural_highlights = ARRAY[
    'Religious significance',
    'Ancient temples',
    'Traditional Tamil culture',
    'Local festivals'
  ],

  best_time_to_visit = 'October to March - Pleasant weather for sightseeing',
  peak_season = 'December to January',
  off_season = 'June to September (Monsoon)',

  climate_info = 'Tropical climate with moderate temperatures year-round due to coastal location',

  weather_data = '{"summer": {"temp_min": 26, "temp_max": 34, "description": "Hot and humid"}, "monsoon": {"temp_min": 24, "temp_max": 30, "description": "Moderate rainfall"}, "winter": {"temp_min": 22, "temp_max": 30, "description": "Pleasant and cool"}}'::jsonb,

  festivals_events = '[{"name": "Pongal", "month": "January", "date": "2025-01-14", "description": "Tamil harvest festival"}, {"name": "Chaitra Purnima Festival", "month": "April", "date": "2025-04-12", "description": "Full moon festival at Kumari Amman Temple"}]'::jsonb,

  recommended_duration = '1-2 days',
  difficulty_level = 'easy',
  adventure_level = 'low',
  family_friendly = true,

  travel_tips = 'Visit the Vivekananda Rock Memorial early morning to avoid crowds. Watch both sunrise and sunset - unique experience. Dress modestly for temple visits. Protect yourself from strong sun and wind at the beach.',

  local_customs = 'Remove footwear before entering temples. Photography may be restricted in some religious sites.',

  safety_info = 'Be cautious of strong sea currents. Avoid swimming as the seas can be rough. Keep belongings secure on the beach.',

  packing_suggestions = ARRAY['Light clothes', 'Sunscreen', 'Hat', 'Comfortable shoes', 'Modest temple wear', 'Camera'],

  nearest_airport = 'Trivandrum International Airport (85 km)',
  nearest_railway = 'Kanyakumari Railway Station',
  local_transport = 'Auto-rickshaws, taxis, local buses',

  meta_title = 'Kanyakumari Tourism - Southernmost Point of India | Vivekananda Rock',
  meta_description = 'Visit Kanyakumari, the confluence of three seas. Witness spectacular sunrise and sunset, Vivekananda Rock Memorial, and Thiruvalluvar Statue.',

  updated_at = NOW()
WHERE id = 1;

-- ======================================================================
-- 3. MUNNAR (ID: 3) - Hill Station Paradise
-- ======================================================================
UPDATE destinations SET
  top_attractions = ARRAY[
    'Tea Plantations',
    'Eravikulam National Park (Nilgiri Tahr)',
    'Mattupetty Dam',
    'Echo Point',
    'Top Station',
    'Anamudi Peak',
    'Tea Museum'
  ],

  activities = ARRAY[
    'Tea Estate Tours',
    'Trekking',
    'Wildlife Spotting',
    'Photography',
    'Boating',
    'Nature Walks',
    'Cycling'
  ],

  specialties = ARRAY[
    'Tea cultivation',
    'Nilgiri Tahr (endangered mountain goat)',
    'Neelakurinji flowers (blooms once in 12 years)',
    'Cool climate',
    'Spice plantations'
  ],

  best_time_to_visit = 'September to May - Pleasant weather ideal for sightseeing',
  peak_season = 'October to February',
  off_season = 'June to August (Monsoon)',

  climate_info = 'Pleasant climate year-round with cool temperatures due to high altitude (1,600m)',

  weather_data = '{"summer": {"temp_min": 15, "temp_max": 25, "description": "Mild and pleasant"}, "monsoon": {"temp_min": 15, "temp_max": 20, "description": "Heavy rainfall, misty"}, "winter": {"temp_min": 10, "temp_max": 20, "description": "Cool and crisp, sometimes foggy"}}'::jsonb,

  festivals_events = '[{"name": "Neelakurinji Blooming", "month": "August-October", "date": "2030-08-01", "description": "Once in 12 years flowering phenomenon"}, {"name": "Tea Festival", "month": "January", "date": "2025-01-20", "description": "Celebration of tea culture"}]'::jsonb,

  recommended_duration = '2-3 days',
  difficulty_level = 'easy',
  adventure_level = 'moderate',
  family_friendly = true,
  eco_friendly = true,

  travel_tips = 'Carry warm clothes as it can get cold, especially in the evenings. Book Eravikulam National Park tickets online in advance. Hire a local guide for trekking. Visit tea factories to see the tea-making process.',

  packing_suggestions = ARRAY['Warm jacket', 'Full pants', 'Comfortable trekking shoes', 'Rain gear', 'Camera', 'Binoculars for wildlife'],

  nearest_airport = 'Cochin International Airport (110 km)',
  nearest_railway = 'Ernakulam Junction (130 km)',

  meta_title = 'Munnar Tourism - Tea Gardens & Hill Station | Kerala',
  meta_description = 'Discover Munnar, Kerala beautiful hill station. Explore lush tea plantations, Eravikulam National Park, and experience cool mountain climate.',

  updated_at = NOW()
WHERE id = 3;

-- ======================================================================
-- 4. ALLEPPEY (ID: 4) - Venice of the East
-- ======================================================================
UPDATE destinations SET
  top_attractions = ARRAY[
    'Backwater Cruises',
    'Houseboat Stays',
    'Vembanad Lake',
    'Alappuzha Beach',
    'Krishnapuram Palace',
    'Marari Beach'
  ],

  activities = ARRAY[
    'Houseboat Cruising',
    'Canoeing',
    'Village Tours',
    'Beach Activities',
    'Bird Watching',
    'Fishing',
    'Kayaking'
  ],

  specialties = ARRAY[
    'Venice of the East',
    'Backwater tourism',
    'Houseboat experiences',
    'Coir industry',
    'Traditional boat races',
    'Toddy (palm wine)'
  ],

  best_time_to_visit = 'November to February - Cool and pleasant for backwater cruises',
  peak_season = 'December to January',
  off_season = 'June to September (Monsoon)',

  climate_info = 'Tropical coastal climate with high humidity throughout the year',

  weather_data = '{"summer": {"temp_min": 25, "temp_max": 35, "description": "Hot and humid"}, "monsoon": {"temp_min": 23, "temp_max": 30, "description": "Heavy rainfall, lush greenery"}, "winter": {"temp_min": 22, "temp_max": 32, "description": "Pleasant and comfortable"}}'::jsonb,

  festivals_events = '[{"name": "Nehru Trophy Boat Race", "month": "August", "date": "2025-08-15", "description": "Spectacular snake boat race"}, {"name": "Onam", "month": "August-September", "date": "2025-09-05", "description": "Grand celebrations with boat races"}]'::jsonb,

  recommended_duration = '2-3 days',
  difficulty_level = 'easy',
  adventure_level = 'low',
  family_friendly = true,

  travel_tips = 'Book houseboats well in advance during peak season. Choose houseboats with good reviews. Carry mosquito repellent. Enjoy fresh seafood on the houseboat. Sunset cruise is highly recommended.',

  packing_suggestions = ARRAY['Light cotton clothes', 'Sunscreen', 'Mosquito repellent', 'Comfortable shoes', 'Swimwear', 'Camera'],

  nearest_airport = 'Cochin International Airport (85 km)',
  nearest_railway = 'Alappuzha Railway Station',

  meta_title = 'Alleppey Backwaters - Houseboat Experience | Venice of East',
  meta_description = 'Experience Alleppey backwaters on a traditional houseboat. Explore serene canals, lush paddy fields, and village life in Gods Own Country.',

  updated_at = NOW()
WHERE id = 4;

-- ======================================================================
-- 5. THEKKADY (ID: 5) - Wildlife & Spices
-- ======================================================================
UPDATE destinations SET
  top_attractions = ARRAY[
    'Periyar Wildlife Sanctuary',
    'Periyar Lake',
    'Spice Plantations',
    'Elephant Junction',
    'Bamboo Rafting',
    'Mangala Devi Temple'
  ],

  activities = ARRAY[
    'Wildlife Safari',
    'Boat Cruises on Periyar Lake',
    'Spice Plantation Tours',
    'Bamboo Rafting',
    'Trekking',
    'Bird Watching',
    'Elephant Rides',
    'Nature Walks'
  ],

  specialties = ARRAY[
    'Wildlife sanctuary',
    'Spice gardens (cardamom, pepper, cinnamon)',
    'Elephants and tigers',
    'Tribal culture',
    'Ayurvedic treatments'
  ],

  best_time_to_visit = 'October to June - Best for wildlife spotting',
  peak_season = 'December to February',
  off_season = 'June to September (Monsoon)',

  climate_info = 'Pleasant tropical climate with cooler temperatures due to elevation',

  weather_data = '{"summer": {"temp_min": 20, "temp_max": 30, "description": "Warm and pleasant"}, "monsoon": {"temp_min": 18, "temp_max": 28, "description": "Moderate rainfall"}, "winter": {"temp_min": 15, "temp_max": 28, "description": "Cool and ideal for safaris"}}'::jsonb,

  festivals_events = '[{"name": "Thekkady Tourism Festival", "month": "December", "date": "2025-12-15", "description": "Cultural showcase and local festivities"}]'::jsonb,

  recommended_duration = '2-3 days',
  difficulty_level = 'moderate',
  adventure_level = 'moderate',
  family_friendly = true,
  eco_friendly = true,
  wildlife_sanctuary = true,

  travel_tips = 'Book wildlife safaris in advance. Early morning is best for wildlife spotting. Wear earth-toned clothes for safaris. Buy authentic spices from plantation tours. Maintain silence during wildlife tours.',

  packing_suggestions = ARRAY['Comfortable trekking shoes', 'Binoculars', 'Camera with zoom lens', 'Light jacket', 'Insect repellent', 'Neutral colored clothes'],

  nearest_airport = 'Madurai Airport (140 km), Cochin Airport (190 km)',
  nearest_railway = 'Kottayam Railway Station (114 km)',

  meta_title = 'Thekkady Wildlife Sanctuary - Periyar National Park | Kerala',
  meta_description = 'Explore Thekkady Periyar Wildlife Sanctuary. Experience wildlife safaris, spice plantations, and nature at its best in Kerala.',

  updated_at = NOW()
WHERE id = 5;

-- ======================================================================
-- 6. GOA (ID: 6) - Beach Paradise
-- ======================================================================
UPDATE destinations SET
  top_attractions = ARRAY[
    'Baga Beach',
    'Calangute Beach',
    'Fort Aguada',
    'Basilica of Bom Jesus',
    'Dudhsagar Waterfalls',
    'Anjuna Flea Market',
    'Palolem Beach'
  ],

  activities = ARRAY[
    'Beach Activities',
    'Water Sports',
    'Nightlife and Parties',
    'Church Visits',
    'River Cruises',
    'Casino Gaming',
    'Dolphin Watching',
    'Shopping',
    'Trekking'
  ],

  specialties = ARRAY[
    'Portuguese heritage',
    'Beach parties',
    'Seafood cuisine',
    'Cashew feni (local liquor)',
    'Indo-Portuguese architecture',
    'Carnival celebrations'
  ],

  best_time_to_visit = 'November to February - Pleasant weather perfect for beaches',
  peak_season = 'December to January (Christmas and New Year)',
  off_season = 'June to September (Monsoon)',

  climate_info = 'Tropical climate with warm temperatures year-round',

  weather_data = '{"summer": {"temp_min": 25, "temp_max": 35, "description": "Hot and humid"}, "monsoon": {"temp_min": 24, "temp_max": 30, "description": "Heavy rainfall, lush green landscape"}, "winter": {"temp_min": 20, "temp_max": 32, "description": "Pleasant and perfect for beach activities"}}'::jsonb,

  festivals_events = '[{"name": "Goa Carnival", "month": "February", "date": "2025-02-22", "description": "Vibrant street festival with parades and music"}, {"name": "Shigmo Festival", "month": "March", "date": "2025-03-15", "description": "Hindu spring festival with colorful floats"}, {"name": "Feast of St. Francis Xavier", "month": "December", "date": "2025-12-03", "description": "Major Catholic celebration"}]'::jsonb,

  recommended_duration = '4-5 days',
  difficulty_level = 'easy',
  adventure_level = 'moderate',
  family_friendly = true,

  travel_tips = 'Rent a scooter or bike to explore at your own pace. Try local Goan cuisine including fish curry rice. Book accommodations early for peak season. North Goa for parties, South Goa for peaceful beaches. Respect local culture when visiting churches.',

  packing_suggestions = ARRAY['Beachwear', 'Sunscreen', 'Light clothes', 'Party outfits', 'Comfortable footwear', 'Modest clothes for churches'],

  nearest_airport = 'Goa International Airport (Dabolim)',
  nearest_railway = 'Madgaon Junction, Thivim Station',
  local_transport = 'Rental bikes/scooters, taxis, buses, app-based cabs',

  meta_title = 'Goa Tourism - Beaches, Nightlife & Portuguese Heritage',
  meta_description = 'Discover Goa beaches, vibrant nightlife, Portuguese churches, and delicious seafood. Plan your perfect beach vacation in India.',

  updated_at = NOW()
WHERE id = 6;

-- ======================================================================
-- 7. LAKSHADWEEP (ID: 134) - Coral Paradise
-- ======================================================================
UPDATE destinations SET
  top_attractions = ARRAY[
    'Agatti Island',
    'Bangaram Island',
    'Kavaratti Island',
    'Minicoy Island',
    'Coral Reefs',
    'Marine Life',
    'Pristine Beaches'
  ],

  activities = ARRAY[
    'Snorkeling',
    'Scuba Diving',
    'Kayaking',
    'Island Hopping',
    'Glass Bottom Boat Rides',
    'Beach Relaxation',
    'Water Sports',
    'Fishing'
  ],

  specialties = ARRAY[
    'Coral atolls',
    'Crystal clear lagoons',
    'Untouched beaches',
    'Marine biodiversity',
    'Eco-tourism',
    'Limited tourism (permits required)'
  ],

  best_time_to_visit = 'October to May - Calm seas perfect for water activities',
  peak_season = 'November to March',
  off_season = 'June to September (Monsoon)',

  climate_info = 'Tropical maritime climate with warm temperatures year-round',

  weather_data = '{"summer": {"temp_min": 25, "temp_max": 32, "description": "Warm with sea breeze"}, "monsoon": {"temp_min": 24, "temp_max": 30, "description": "Rough seas, not ideal for water sports"}, "winter": {"temp_min": 22, "temp_max": 30, "description": "Perfect weather for beach activities"}}'::jsonb,

  festivals_events = '[{"name": "Eid-ul-Fitr", "month": "Varies", "date": "2025-04-01", "description": "Major Islamic festival celebrated across the islands"}]'::jsonb,

  recommended_duration = '4-5 days',
  difficulty_level = 'moderate',
  adventure_level = 'high',
  eco_friendly = true,

  travel_tips = 'Entry permit mandatory - apply well in advance. Alcohol is prohibited. Limited ATM facilities - carry sufficient cash. Respect local Islamic culture. Book accommodations through approved tour operators only. Photography restrictions apply in some areas.',

  packing_suggestions = ARRAY['Snorkeling gear', 'Underwater camera', 'Reef-safe sunscreen', 'Light clothes', 'First aid kit', 'Cash', 'Modest swimwear'],

  nearest_airport = 'Agatti Airport (accessible from Kochi)',

  meta_title = 'Lakshadweep Islands - Coral Reefs & Pristine Beaches',
  meta_description = 'Explore Lakshadweep pristine coral islands. Experience world-class diving, snorkeling, and untouched natural beauty.',

  updated_at = NOW()
WHERE id = 134;

-- ======================================================================
-- 8. COCHIN (ID: 2) - Queen of Arabian Sea
-- ======================================================================
UPDATE destinations SET
  top_attractions = ARRAY[
    'Fort Kochi',
    'Chinese Fishing Nets',
    'Mattancherry Palace',
    'Jewish Synagogue',
    'St. Francis Church',
    'Marine Drive',
    'Bolgatty Palace'
  ],

  activities = ARRAY[
    'Heritage Walks',
    'Backwater Cruises',
    'Kathakali Performances',
    'Spice Market Visits',
    'Art Gallery Tours',
    'Shopping',
    'Sunset Viewing'
  ],

  specialties = ARRAY[
    'Colonial architecture',
    'Chinese fishing nets',
    'Spice trade history',
    'Kochi-Muziris Biennale',
    'Seafood cuisine',
    'Cultural diversity'
  ],

  best_time_to_visit = 'October to March - Pleasant weather for exploring',
  peak_season = 'December to February',
  off_season = 'June to September (Monsoon)',

  recommended_duration = '2-3 days',
  difficulty_level = 'easy',
  adventure_level = 'low',
  family_friendly = true,

  nearest_airport = 'Cochin International Airport',
  nearest_railway = 'Ernakulam Junction',

  updated_at = NOW()
WHERE id = 2;

-- ======================================================================
-- 9. Update remaining destinations with basic enrichment
-- ======================================================================
UPDATE destinations SET
  recommended_duration = COALESCE(recommended_duration, '3-4 days'),
  difficulty_level = COALESCE(difficulty_level, 'easy'),
  adventure_level = COALESCE(adventure_level, 'moderate'),
  family_friendly = COALESCE(family_friendly, true),
  best_time_to_visit = COALESCE(best_time_to_visit, 'October to March - Pleasant weather'),
  peak_season = COALESCE(peak_season, 'December to January'),
  off_season = COALESCE(off_season, 'June to September (Monsoon)'),
  updated_at = NOW()
WHERE id IN (128, 129, 130, 131, 133);

-- ======================================================================
-- Refresh the materialized view to include new data
-- ======================================================================
SELECT refresh_popular_destinations();

-- ======================================================================
-- VERIFICATION QUERY
-- ======================================================================
SELECT
  id,
  name,
  array_length(top_attractions, 1) as num_attractions,
  array_length(activities, 1) as num_activities,
  best_time_to_visit IS NOT NULL as has_timing_info,
  festivals_events IS NOT NULL as has_festivals,
  weather_data IS NOT NULL as has_weather
FROM destinations
WHERE is_active = true
ORDER BY id;

-- ======================================================================
-- SUCCESS MESSAGE
-- ======================================================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Destination data enrichment completed!';
  RAISE NOTICE 'Enriched destinations: Kerala, Kanyakumari, Munnar, Alleppey, Thekkady, Goa, Lakshadweep, Cochin';
  RAISE NOTICE 'Materialized view refreshed successfully';
  RAISE NOTICE '========================================';
END $$;
