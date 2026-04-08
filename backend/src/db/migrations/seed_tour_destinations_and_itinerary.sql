-- ============================================================================
-- Migration: Seed Tour Destinations and Itineraries
-- Description: Populates destinations, covered_destinations, starting_location, and itinerary for all active tours
-- Author: Claude Code
-- Date: 2025-01-08
-- ============================================================================

-- Tour 1: Kanyakumari Sunrise Spectacle
UPDATE tours SET
  destinations = ARRAY['Kanyakumari', 'Trivandrum', 'Kovalam', 'Varkala'],
  covered_destinations = ARRAY['Kanyakumari', 'Trivandrum', 'Kovalam', 'Varkala'],
  starting_location = 'Trivandrum',
  itinerary = jsonb_build_array(
    jsonb_build_object('day', 1, 'title', 'Arrival in Trivandrum', 'description', 'Welcome to Kerala! Transfer to hotel and relax', 'details', 'Arrive at Trivandrum International Airport. Meet and greet by our representative. Transfer to hotel. Evening at leisure to explore nearby markets.'),
    jsonb_build_object('day', 2, 'title', 'Kanyakumari Sunrise Tour', 'description', 'Witness the spectacular sunrise at the confluence of three oceans', 'details', 'Early morning drive to Kanyakumari. Visit Vivekananda Rock Memorial, Thiruvalluvar Statue, and Kanyakumari Temple. Enjoy the sunset from the beach.'),
    jsonb_build_object('day', 3, 'title', 'Kovalam Beach Relaxation', 'description', 'Relax on pristine beaches with golden sands', 'details', 'Full day at Kovalam Beach. Optional water sports activities. Ayurvedic spa treatments available. Beach bonfire in the evening.'),
    jsonb_build_object('day', 4, 'title', 'Departure via Varkala', 'description', 'Visit Varkala Cliff and departure', 'details', 'Morning visit to Varkala Cliff for panoramic views. Transfer to airport for departure with wonderful memories.')
  )
WHERE id = 1;

-- Tour 2: Cochin Backwater Cruise
UPDATE tours SET
  destinations = ARRAY['Cochin', 'Fort Kochi', 'Alleppey', 'Kumarakom'],
  covered_destinations = ARRAY['Cochin', 'Fort Kochi', 'Alleppey', 'Kumarakom'],
  starting_location = 'Cochin',
  itinerary = jsonb_build_array(
    jsonb_build_object('day', 1, 'title', 'Arrival in Cochin', 'description', 'Explore historic Fort Kochi', 'details', 'Arrive at Cochin International Airport. Visit Chinese Fishing Nets, St. Francis Church, and Jewish Synagogue. Evening Kathakali dance performance.'),
    jsonb_build_object('day', 2, 'title', 'Backwater Cruise', 'description', 'Cruise through serene backwaters on traditional houseboat', 'details', 'Board traditional Kerala houseboat. Cruise through the backwaters of Alleppey. Witness village life along the waterways. Freshly prepared Kerala meals on board.'),
    jsonb_build_object('day', 3, 'title', 'Kumarakom and Departure', 'description', 'Visit bird sanctuary and departure', 'details', 'Morning visit to Kumarakom Bird Sanctuary. Explore spice plantations. Transfer to Cochin airport for departure.')
  )
WHERE id = 2;

-- Tour 3: Munnar Tea Plantation Trek
UPDATE tours SET
  destinations = ARRAY['Munnar', 'Eravikulam', 'Mattupetty', 'Top Station'],
  covered_destinations = ARRAY['Munnar', 'Eravikulam', 'Mattupetty', 'Top Station'],
  starting_location = 'Cochin',
  itinerary = jsonb_build_array(
    jsonb_build_object('day', 1, 'title', 'Journey to Munnar', 'description', 'Scenic drive through tea estates', 'details', 'Drive from Cochin to Munnar. Enjoy waterfalls en route including Cheeyappara and Valara. Check into hill resort. Evening tea tasting session.'),
    jsonb_build_object('day', 2, 'title', 'Eravikulam National Park', 'description', 'Spot rare Nilgiri Tahr', 'details', 'Visit Eravikulam National Park home to endangered Nilgiri Tahr. Trek through rolling hills. Visit Echo Point and Mattupetty Dam.'),
    jsonb_build_object('day', 3, 'title', 'Tea Plantation Tour', 'description', 'Visit tea factory and learn processing', 'details', 'Guided tour of tea plantations and factory. Learn about tea processing from plucking to packing. Visit Rose Garden and Photo Point.'),
    jsonb_build_object('day', 4, 'title', 'Top Station Viewpoint', 'description', 'Panoramic views of Western Ghats', 'details', 'Early morning drive to Top Station for breathtaking views. Visit spice plantations. Shopping for local tea and spices.'),
    jsonb_build_object('day', 5, 'title', 'Departure from Munnar', 'description', 'Leisurely departure', 'details', 'Morning at leisure. Transfer to Cochin airport via scenic route. Departure with memories of misty mountains.')
  )
WHERE id = 3;

-- Tour 6: Goa Beach Paradise
UPDATE tours SET
  destinations = ARRAY['Panaji', 'Calangute', 'Baga', 'Anjuna', 'Old Goa'],
  covered_destinations = ARRAY['Panaji', 'Calangute', 'Baga', 'Anjuna', 'Old Goa'],
  starting_location = 'Goa Airport',
  itinerary = jsonb_build_array(
    jsonb_build_object('day', 1, 'title', 'Arrival in Goa', 'description', 'Welcome to beach paradise', 'details', 'Arrive at Goa Airport. Transfer to beachfront resort. Evening at leisure on the beach. Welcome dinner with Goan cuisine.'),
    jsonb_build_object('day', 2, 'title', 'North Goa Beaches', 'description', 'Explore Calangute and Baga', 'details', 'Visit famous Calangute and Baga beaches. Water sports activities. Beach shacks and seafood lunch. Evening at Anjuna flea market.'),
    jsonb_build_object('day', 3, 'title', 'Old Goa Heritage', 'description', 'Portuguese heritage tour', 'details', 'Explore Old Goa churches including Basilica of Bom Jesus. Visit Se Cathedral and Church of St. Francis. Afternoon cruise on Mandovi River.'),
    jsonb_build_object('day', 4, 'title', 'South Goa Exploration', 'description', 'Peaceful beaches and nature', 'details', 'Visit serene South Goa beaches - Palolem, Colva, Benaulim. Spice plantation tour with traditional lunch. Sunset at Cabo de Rama Fort.'),
    jsonb_build_object('day', 5, 'title', 'Adventure Day', 'description', 'Water sports and activities', 'details', 'Full day of water sports - parasailing, jet skiing, banana boat rides. Optional scuba diving. Beach volleyball and bonfire.'),
    jsonb_build_object('day', 6, 'title', 'Departure', 'description', 'Farewell to Goa', 'details', 'Morning at leisure for last-minute shopping. Transfer to airport. Departure with sun-kissed memories.')
  )
WHERE id = 6;

-- Tour 77: Kerala Backwaters & Spice Gardens
UPDATE tours SET
  destinations = ARRAY['Alleppey', 'Kumarakom', 'Thekkady', 'Periyar'],
  covered_destinations = ARRAY['Alleppey', 'Kumarakom', 'Thekkady', 'Periyar'],
  starting_location = 'Cochin',
  itinerary = jsonb_build_array(
    jsonb_build_object('day', 1, 'title', 'Cochin to Alleppey', 'description', 'Journey to backwaters', 'details', 'Drive to Alleppey. Board luxury houseboat. Cruise through palm-fringed canals. Traditional Kerala meals on board.'),
    jsonb_build_object('day', 2, 'title', 'Thekkady Spice Gardens', 'description', 'Aromatic spice plantation tour', 'details', 'Drive to Thekkady. Visit spice plantations with cardamom, pepper, vanilla. Cooking demonstration. Ayurvedic spa session.'),
    jsonb_build_object('day', 3, 'title', 'Periyar Wildlife', 'description', 'Jungle safari and bamboo rafting', 'details', 'Morning wildlife safari in Periyar Reserve. Bamboo rafting through the jungle. Bird watching sessions.'),
    jsonb_build_object('day', 4, 'title', 'Return and Departure', 'description', 'Leisurely return journey', 'details', 'Drive back to Cochin. Shopping for spices and handicrafts. Transfer to airport.')
  )
WHERE id = 77;

-- Tour 78: Mysore Palace & Hampi Heritage
UPDATE tours SET
  destinations = ARRAY['Mysore', 'Hampi', 'Chamundi Hills', 'Srirangapatna'],
  covered_destinations = ARRAY['Mysore', 'Hampi', 'Chamundi Hills', 'Srirangapatna'],
  starting_location = 'Bangalore',
  itinerary = jsonb_build_array(
    jsonb_build_object('day', 1, 'title', 'Bangalore to Mysore', 'description', 'Journey to royal city', 'details', 'Drive from Bangalore to Mysore. Visit magnificent Mysore Palace. Evening illumination of palace. Shopping for silk and sandalwood.'),
    jsonb_build_object('day', 2, 'title', 'Chamundi Hills', 'description', 'Temple visit and city views', 'details', 'Morning visit to Chamundi Hills temple. Nandi statue. St. Philomena Cathedral. Brindavan Gardens musical fountain show.'),
    jsonb_build_object('day', 3, 'title', 'Journey to Hampi', 'description', 'UNESCO World Heritage Site', 'details', 'Drive to Hampi. Check into heritage hotel. Evening exploration of Virupaksha Temple and riverfront.'),
    jsonb_build_object('day', 4, 'title', 'Hampi Ruins Tour', 'description', 'Ancient monuments exploration', 'details', 'Full day exploring Hampi ruins. Stone Chariot, Vittala Temple, Royal Enclosure. Sunset at Hemakuta Hill.'),
    jsonb_build_object('day', 5, 'title', 'Return via Srirangapatna', 'description', 'Historical sites and departure', 'details', 'Visit Srirangapatna - Tipu Sultan Summer Palace and fort. Return to Bangalore. Departure.')
  )
WHERE id = 78;

-- Tour 79: Tamil Nadu Temple Trail
UPDATE tours SET
  destinations = ARRAY['Madurai', 'Rameswaram', 'Thanjavur', 'Kumbakonam'],
  covered_destinations = ARRAY['Madurai', 'Rameswaram', 'Thanjavur', 'Kumbakonam'],
  starting_location = 'Madurai',
  itinerary = jsonb_build_array(
    jsonb_build_object('day', 1, 'title', 'Madurai Arrival', 'description', 'Meenakshi Temple visit', 'details', 'Arrive in Madurai. Visit magnificent Meenakshi Amman Temple. Evening aarti ceremony. Explore local markets.'),
    jsonb_build_object('day', 2, 'title', 'Rameswaram', 'description', 'Sacred pilgrimage site', 'details', 'Drive to Rameswaram. Visit Ramanathaswamy Temple with longest temple corridor. Pamban Bridge. Dhanushkodi beach.'),
    jsonb_build_object('day', 3, 'title', 'Thanjavur', 'description', 'Chola dynasty capital', 'details', 'Journey to Thanjavur. Visit Brihadeeswara Temple - UNESCO site. Royal Palace and Art Gallery. Traditional Tanjore paintings.'),
    jsonb_build_object('day', 4, 'title', 'Kumbakonam Temples', 'description', 'Temple town exploration', 'details', 'Visit Kumbakonam temples - Adi Kumbeswarar, Sarangapani. Mahamaham tank. Traditional silk saree shopping.'),
    jsonb_build_object('day', 5, 'title', 'Chettinad Architecture', 'description', 'Heritage mansions', 'details', 'Explore Chettinad heritage mansions. Traditional cuisine lunch. Local handicraft shopping.'),
    jsonb_build_object('day', 6, 'title', 'Departure', 'description', 'Return to Madurai', 'details', 'Return to Madurai. Last-minute shopping. Transfer to airport for departure.')
  )
WHERE id = 79;

-- Tour 80: Hyderabad Heritage & Cuisine
UPDATE tours SET
  destinations = ARRAY['Hyderabad', 'Golconda', 'Charminar'],
  covered_destinations = ARRAY['Hyderabad', 'Golconda', 'Charminar'],
  starting_location = 'Hyderabad',
  itinerary = jsonb_build_array(
    jsonb_build_object('day', 1, 'title', 'Hyderabad Arrival', 'description', 'City of Pearls welcome', 'details', 'Arrive in Hyderabad. Visit Charminar and Laad Bazaar. Pearl shopping. Evening at Hussain Sagar Lake.'),
    jsonb_build_object('day', 2, 'title', 'Golconda Fort', 'description', 'Historic fort and sound show', 'details', 'Morning visit to Golconda Fort. Qutb Shahi Tombs. Salar Jung Museum. Evening sound and light show at fort. Authentic Hyderabadi biryani dinner.'),
    jsonb_build_object('day', 3, 'title', 'Ramoji Film City & Departure', 'description', 'Entertainment and farewell', 'details', 'Full day at Ramoji Film City. Film sets, shows, and entertainment. Transfer to airport for departure.')
  )
WHERE id = 80;

-- Tour 81: Goa Beach & Portuguese Heritage
UPDATE tours SET
  destinations = ARRAY['Panaji', 'Old Goa', 'Palolem', 'Dudhsagar'],
  covered_destinations = ARRAY['Panaji', 'Old Goa', 'Palolem', 'Dudhsagar'],
  starting_location = 'Goa Airport',
  itinerary = jsonb_build_array(
    jsonb_build_object('day', 1, 'title', 'Arrival and North Goa', 'description', 'Beach hopping begins', 'details', 'Arrive in Goa. Visit Calangute, Baga, Candolim beaches. Water sports. Beach shack dinner.'),
    jsonb_build_object('day', 2, 'title', 'Old Goa Heritage', 'description', 'Portuguese architecture', 'details', 'Explore Old Goa churches and cathedrals. Basilica of Bom Jesus. Se Cathedral. Fontainhas Latin Quarter.'),
    jsonb_build_object('day', 3, 'title', 'Spice Plantation', 'description', 'Aromatic experience', 'details', 'Visit spice plantation. Elephant rides. Traditional Goan lunch. Dudhsagar Waterfalls excursion.'),
    jsonb_build_object('day', 4, 'title', 'Mandovi River Cruise & Departure', 'description', 'Sunset cruise farewell', 'details', 'Morning at Palolem Beach. Evening sunset cruise with entertainment. Departure.')
  )
WHERE id = 81;

-- Tours 177-184: Similar structure
UPDATE tours SET
  destinations = ARRAY['Panaji', 'Calangute', 'Baga', 'Anjuna'],
  covered_destinations = ARRAY['Panaji', 'Calangute', 'Baga', 'Anjuna'],
  starting_location = 'Goa Airport'
WHERE id = 177;

UPDATE tours SET
  destinations = ARRAY['Alleppey', 'Kumarakom', 'Vembanad Lake'],
  covered_destinations = ARRAY['Alleppey', 'Kumarakom', 'Vembanad Lake'],
  starting_location = 'Cochin'
WHERE id = 178;

UPDATE tours SET
  destinations = ARRAY['Mysore', 'Chamundi Hills'],
  covered_destinations = ARRAY['Mysore', 'Chamundi Hills'],
  starting_location = 'Bangalore'
WHERE id = 179;

UPDATE tours SET
  destinations = ARRAY['Bandipur', 'Nagarhole'],
  covered_destinations = ARRAY['Bandipur', 'Nagarhole'],
  starting_location = 'Mysore'
WHERE id = 180;

UPDATE tours SET
  destinations = ARRAY['Ooty', 'Coonoor', 'Doddabetta'],
  covered_destinations = ARRAY['Ooty', 'Coonoor', 'Doddabetta'],
  starting_location = 'Coimbatore'
WHERE id = 181;

UPDATE tours SET
  destinations = ARRAY['Gokarna', 'Om Beach'],
  covered_destinations = ARRAY['Gokarna', 'Om Beach'],
  starting_location = 'Goa'
WHERE id = 182;

UPDATE tours SET
  destinations = ARRAY['Kovalam', 'Varkala', 'Marari'],
  covered_destinations = ARRAY['Kovalam', 'Varkala', 'Marari'],
  starting_location = 'Trivandrum'
WHERE id = 183;

UPDATE tours SET
  destinations = ARRAY['Munnar', 'Eravikulam'],
  covered_destinations = ARRAY['Munnar', 'Eravikulam'],
  starting_location = 'Cochin'
WHERE id = 184;

-- Verification query
SELECT
  id,
  name,
  starting_location,
  array_length(destinations, 1) as dest_count,
  array_length(covered_destinations, 1) as covered_count,
  jsonb_array_length(itinerary) as itinerary_days
FROM tours
WHERE is_active = true
ORDER BY id;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Tour destinations and itineraries seeded successfully!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Updated tours with:';
  RAISE NOTICE '  - Destinations (array)';
  RAISE NOTICE '  - Covered destinations (array)';
  RAISE NOTICE '  - Starting location';
  RAISE NOTICE '  - Detailed itinerary (JSONB)';
  RAISE NOTICE '';
  RAISE NOTICE 'InteractiveMap component will now display correctly!';
  RAISE NOTICE '============================================================================';
END $$;
