-- =====================================================
-- Seed Addon Reviews for All Tours
-- This script creates realistic reviews for all addons
-- =====================================================

-- First, let's clear existing addon reviews (except the 2 we already have)
-- DELETE FROM addon_reviews WHERE id > 4;

-- Function to insert addon reviews with proper booking references
DO $$
DECLARE
  v_booking_id INTEGER;
  v_user_id INTEGER;
  v_package_tier_id INTEGER;
BEGIN
  -- Get a default package tier for our bookings
  SELECT id INTO v_package_tier_id FROM packagetiers LIMIT 1;

  -- Reviews for Addon 1: Romantic Candlelight Dinner
  -- Already has review id 3, adding more

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 2, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '15 days', 25000,
    '[{"id": 1, "name": "Romantic Candlelight Dinner", "price": 3500, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '15 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 1, 5,
    'The candlelight dinner was incredibly romantic. Perfect ambiance, delicious food, and excellent service. Highly recommend for couples!',
    CURRENT_DATE - INTERVAL '14 days');

  -- Another review for Addon 1
  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 4, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '20 days', 28000,
    '[{"id": 1, "name": "Romantic Candlelight Dinner", "price": 3500, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '35 days', CURRENT_DATE - INTERVAL '20 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 1, 4,
    'Beautiful setting and great food. Only minor issue was the service was a bit slow, but overall a wonderful experience.',
    CURRENT_DATE - INTERVAL '19 days');

  -- Reviews for Addon 2: Expert Local Guide
  -- Already has review id 4, adding more

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 1, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '10 days', 32000,
    '[{"id": 2, "name": "Expert Local Guide", "price": 6000, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE - INTERVAL '10 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 2, 5,
    'Our guide was exceptional! Deep knowledge of local history and culture. Made the whole trip so much more meaningful.',
    CURRENT_DATE - INTERVAL '9 days');

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 3, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '12 days', 29000,
    '[{"id": 2, "name": "Expert Local Guide", "price": 6000, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '27 days', CURRENT_DATE - INTERVAL '12 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 2, 5,
    'Best decision we made! The guide showed us hidden gems we would never have found on our own.',
    CURRENT_DATE - INTERVAL '11 days');

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 5, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '8 days', 31000,
    '[{"id": 2, "name": "Expert Local Guide", "price": 6000, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '23 days', CURRENT_DATE - INTERVAL '8 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 2, 4,
    'Very knowledgeable guide. Spoke excellent English and was very patient with our questions.',
    CURRENT_DATE - INTERVAL '7 days');

  -- Reviews for Addon 3: Premium Ayurvedic Spa Retreat

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 2, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '18 days', 27000,
    '[{"id": 3, "name": "Premium Ayurvedic Spa Retreat", "price": 4000, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '33 days', CURRENT_DATE - INTERVAL '18 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 3, 5,
    'Absolutely divine! The spa treatments were authentic and incredibly relaxing. The therapists were highly skilled.',
    CURRENT_DATE - INTERVAL '17 days');

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 4, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '22 days', 26500,
    '[{"id": 3, "name": "Premium Ayurvedic Spa Retreat", "price": 4000, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '37 days', CURRENT_DATE - INTERVAL '22 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 3, 5,
    'Best spa experience ever! Traditional Ayurvedic treatments done right. Left feeling completely rejuvenated.',
    CURRENT_DATE - INTERVAL '21 days');

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 6, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '16 days', 28500,
    '[{"id": 3, "name": "Premium Ayurvedic Spa Retreat", "price": 4000, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '31 days', CURRENT_DATE - INTERVAL '16 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 3, 4,
    'Wonderful experience. The herbal oils and massage techniques were amazing. Facilities were very clean and peaceful.',
    CURRENT_DATE - INTERVAL '15 days');

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 183, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '13 days', 29500,
    '[{"id": 3, "name": "Premium Ayurvedic Spa Retreat", "price": 4000, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '28 days', CURRENT_DATE - INTERVAL '13 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 3, 5,
    'Highly recommend! The consultation was thorough and the treatments were customized to my needs.',
    CURRENT_DATE - INTERVAL '12 days');

  -- Reviews for Addon 4: Sunrise Yoga & Meditation

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 3, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '14 days', 24000,
    '[{"id": 4, "name": "Sunrise Yoga & Meditation", "price": 2500, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE - INTERVAL '14 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 4, 5,
    'Magical experience! Watching the sunrise while doing yoga was incredibly peaceful. The instructor was excellent.',
    CURRENT_DATE - INTERVAL '13 days');

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 4, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '19 days', 25500,
    '[{"id": 4, "name": "Sunrise Yoga & Meditation", "price": 2500, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '34 days', CURRENT_DATE - INTERVAL '19 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 4, 4,
    'Great way to start the day. The location was beautiful and the session was well-paced for all skill levels.',
    CURRENT_DATE - INTERVAL '18 days');

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 6, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '11 days', 23500,
    '[{"id": 4, "name": "Sunrise Yoga & Meditation", "price": 2500, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '26 days', CURRENT_DATE - INTERVAL '11 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 4, 5,
    'Perfect for beginners and experienced yogis alike. Very calming and energizing at the same time!',
    CURRENT_DATE - INTERVAL '10 days');

  -- Reviews for Addon 5: Professional Photography Session

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 1, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '17 days', 30000,
    '[{"id": 5, "name": "Professional Photography Session", "price": 5500, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '32 days', CURRENT_DATE - INTERVAL '17 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 5, 5,
    'Worth every penny! The photographer captured amazing moments. Got our photos within 3 days and they were stunning!',
    CURRENT_DATE - INTERVAL '16 days');

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 3, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '21 days', 31000,
    '[{"id": 5, "name": "Professional Photography Session", "price": 5500, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '36 days', CURRENT_DATE - INTERVAL '21 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 5, 5,
    'Amazing photographer! Very professional and creative. The photos are memories we will treasure forever.',
    CURRENT_DATE - INTERVAL '20 days');

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 5, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '9 days', 29500,
    '[{"id": 5, "name": "Professional Photography Session", "price": 5500, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '24 days', CURRENT_DATE - INTERVAL '9 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 5, 4,
    'Great service! The photographer knew all the best spots. Would have been 5 stars if delivery was a bit faster.',
    CURRENT_DATE - INTERVAL '8 days');

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 183, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '7 days', 32000,
    '[{"id": 5, "name": "Professional Photography Session", "price": 5500, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '22 days', CURRENT_DATE - INTERVAL '7 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 5, 5,
    'Exceptional quality! The photographer was patient and got perfect shots. Absolutely recommend this addon.',
    CURRENT_DATE - INTERVAL '6 days');

  -- Reviews for Addon 6: Water Sports Package

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 81, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '25 days', 28000,
    '[{"id": 6, "name": "Water Sports Package", "price": 4500, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '25 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 6, 5,
    'So much fun! Tried parasailing, jet skiing, and banana boat. All equipment was in great condition and staff were very safety-conscious.',
    CURRENT_DATE - INTERVAL '24 days');

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 183, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '23 days', 27500,
    '[{"id": 6, "name": "Water Sports Package", "price": 4500, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '38 days', CURRENT_DATE - INTERVAL '23 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 6, 4,
    'Great variety of water sports. Had to wait a bit for our turn but it was worth it. Highly recommend!',
    CURRENT_DATE - INTERVAL '22 days');

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 177, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '15 days', 29000,
    '[{"id": 6, "name": "Water Sports Package", "price": 4500, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '15 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 6, 5,
    'Adrenaline rush! The instructors were professional and made us feel safe. Best part of our beach vacation!',
    CURRENT_DATE - INTERVAL '14 days');

  -- Reviews for Addon 7: Traditional Cultural Show & Dinner

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 1, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '26 days', 26000,
    '[{"id": 7, "name": "Traditional Cultural Show & Dinner", "price": 4200, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '41 days', CURRENT_DATE - INTERVAL '26 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 7, 5,
    'Mesmerizing cultural performance! The traditional dances were beautiful and the dinner was authentic and delicious.',
    CURRENT_DATE - INTERVAL '25 days');

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 5, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '20 days', 27000,
    '[{"id": 7, "name": "Traditional Cultural Show & Dinner", "price": 4200, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '35 days', CURRENT_DATE - INTERVAL '20 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 7, 4,
    'Wonderful evening! Great introduction to local culture. The performers were talented and the food was excellent.',
    CURRENT_DATE - INTERVAL '19 days');

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 78, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '12 days', 25500,
    '[{"id": 7, "name": "Traditional Cultural Show & Dinner", "price": 4200, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '27 days', CURRENT_DATE - INTERVAL '12 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 7, 5,
    'Absolutely loved it! The show was vibrant and engaging. A must-do to experience the local culture.',
    CURRENT_DATE - INTERVAL '11 days');

  -- Reviews for Addon 8: Private Airport Transfer

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 78, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '28 days', 22000,
    '[{"id": 8, "name": "Private Airport Transfer", "price": 2000, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '43 days', CURRENT_DATE - INTERVAL '28 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 8, 5,
    'Very convenient! The driver was punctual, professional, and the car was clean and comfortable. No stress at all!',
    CURRENT_DATE - INTERVAL '27 days');

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 79, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '24 days', 23000,
    '[{"id": 8, "name": "Private Airport Transfer", "price": 2000, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '39 days', CURRENT_DATE - INTERVAL '24 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 8, 5,
    'Excellent service! Driver was waiting with a name sign. Made our arrival so smooth and hassle-free.',
    CURRENT_DATE - INTERVAL '23 days');

  SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
  INSERT INTO bookings (user_id, tour_id, package_tier_id, number_of_persons, status, travel_date, total_price, selected_addons, inquiry_date, completed_at)
  VALUES (v_user_id, 80, v_package_tier_id, 2, 'Completed', CURRENT_DATE - INTERVAL '18 days', 21500,
    '[{"id": 8, "name": "Private Airport Transfer", "price": 2000, "quantity": 1}]'::jsonb,
    CURRENT_DATE - INTERVAL '33 days', CURRENT_DATE - INTERVAL '18 days')
  RETURNING id INTO v_booking_id;

  INSERT INTO addon_reviews (user_id, booking_id, addon_id, rating, comment, created_at)
  VALUES (v_user_id, v_booking_id, 8, 4,
    'Good service. The driver was friendly and helpful with our luggage. Would recommend!',
    CURRENT_DATE - INTERVAL '17 days');

  RAISE NOTICE 'Successfully created reviews for all addons!';

END $$;

-- Verify the results
SELECT
  a.id,
  a.name,
  COUNT(ar.id) as review_count,
  ROUND(AVG(ar.rating)::numeric, 2) as avg_rating
FROM addons a
LEFT JOIN addon_reviews ar ON a.id = ar.addon_id
WHERE a.is_active = true
GROUP BY a.id, a.name
ORDER BY a.id;
