-- Script pour ajouter des reviews réalistes pour plusieurs tours
-- Nettoyer les anciennes reviews de test
DELETE FROM reviews WHERE review_text LIKE 'Excellent tour!%';

-- Insérer des reviews réalistes pour différents tours
DO $$
DECLARE
    v_user_id INTEGER;
    v_tour_id INTEGER;
BEGIN
    -- Reviews pour Tour ID 1 (Kanyakumari Sunrise Spectacle)
    SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
    INSERT INTO reviews (user_id, tour_id, rating, review_text, is_approved, travel_date, verified_purchase, helpful_count, submission_date)
    VALUES (
        v_user_id,
        1,
        5,
        'Absolutely breathtaking experience! Watching the sunrise at the confluence of three oceans was magical. Our guide was incredibly knowledgeable about the history and culture. The Vivekananda Rock Memorial visit was peaceful and inspiring. Highly recommend this tour for anyone visiting Tamil Nadu!',
        true,
        CURRENT_DATE - INTERVAL '45 days',
        true,
        15,
        CURRENT_DATE - INTERVAL '42 days'
    );

    SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
    INSERT INTO reviews (user_id, tour_id, rating, review_text, is_approved, travel_date, verified_purchase, helpful_count, submission_date, response_from_admin, responded_at)
    VALUES (
        v_user_id,
        1,
        4,
        'Great tour overall! The sunrise was stunning, though we had to wake up very early (4:30 AM). The temple visits were interesting and well-organized. The only minor issue was the breakfast could have been better. Still, a memorable experience that I would recommend to friends and family.',
        true,
        CURRENT_DATE - INTERVAL '30 days',
        true,
        8,
        CURRENT_DATE - INTERVAL '28 days',
        'Thank you for your feedback! We have noted your comment about breakfast and are working to improve our meal options.',
        CURRENT_DATE - INTERVAL '27 days'
    );

    SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
    INSERT INTO reviews (user_id, tour_id, rating, review_text, is_approved, travel_date, verified_purchase, helpful_count, submission_date)
    VALUES (
        v_user_id,
        1,
        5,
        'This tour exceeded all my expectations! The spiritual atmosphere at Kanyakumari is indescribable. Our guide spoke excellent English and shared fascinating stories about the place. The timing was perfect - we got amazing photos of the sunrise. The boat ride to Vivekananda Rock was smooth and enjoyable. Worth every penny!',
        true,
        CURRENT_DATE - INTERVAL '20 days',
        true,
        22,
        CURRENT_DATE - INTERVAL '18 days'
    );

    -- Reviews pour Tour ID 2 (Cochin Backwater Cruise)
    SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
    INSERT INTO reviews (user_id, tour_id, rating, review_text, is_approved, travel_date, verified_purchase, helpful_count, submission_date)
    VALUES (
        v_user_id,
        2,
        5,
        'One of the most relaxing experiences of my life! The houseboat was beautiful and well-maintained. The crew was friendly and the food was delicious - authentic Kerala cuisine prepared fresh onboard. Watching the sunset over the backwaters while sipping chai was pure bliss. Cannot recommend this enough!',
        true,
        CURRENT_DATE - INTERVAL '60 days',
        true,
        28,
        CURRENT_DATE - INTERVAL '57 days'
    );

    SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
    INSERT INTO reviews (user_id, tour_id, rating, review_text, is_approved, travel_date, verified_purchase, helpful_count, submission_date)
    VALUES (
        v_user_id,
        2,
        4,
        'Lovely experience cruising through the backwaters. The scenery was picturesque with palm trees, fishing villages, and peaceful waterways. The houseboat had all basic amenities. Food was good but a bit spicy for my taste. Would have loved more time on the cruise. Overall, a great way to experience Kerala culture.',
        true,
        CURRENT_DATE - INTERVAL '40 days',
        true,
        12,
        CURRENT_DATE - INTERVAL '38 days'
    );

    -- Reviews pour Tour ID 6 (Munnar Tea Gardens Adventure)
    SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
    INSERT INTO reviews (user_id, tour_id, rating, review_text, is_approved, travel_date, verified_purchase, helpful_count, submission_date)
    VALUES (
        v_user_id,
        6,
        5,
        'Munnar is paradise on earth! The tea plantations stretching across the hills are a sight to behold. We learned so much about tea processing at the factory. The visit to Eravikulam National Park where we saw Nilgiri Tahr was a bonus. Cool climate, fresh air, and stunning views everywhere. Perfect for nature lovers!',
        true,
        CURRENT_DATE - INTERVAL '35 days',
        true,
        19,
        CURRENT_DATE - INTERVAL '33 days'
    );

    SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
    INSERT INTO reviews (user_id, tour_id, rating, review_text, is_approved, travel_date, verified_purchase, helpful_count, submission_date, response_from_admin, responded_at)
    VALUES (
        v_user_id,
        6,
        3,
        'The tea gardens were beautiful but the tour felt a bit rushed. We only had 30 minutes at the tea factory which was not enough. The drive up was scenic but quite long and winding - not suitable for those with motion sickness. Guide was knowledgeable but could have been more engaging. Photos came out great though!',
        true,
        CURRENT_DATE - INTERVAL '25 days',
        true,
        5,
        CURRENT_DATE - INTERVAL '23 days',
        'Thank you for your honest feedback. We are reviewing our itinerary to allow more time at each location. We appreciate your patience with the mountain roads.',
        CURRENT_DATE - INTERVAL '22 days'
    );

    -- Reviews pour Tour ID 183 (Tour avec addons)
    SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
    INSERT INTO reviews (user_id, tour_id, rating, review_text, is_approved, travel_date, verified_purchase, helpful_count, submission_date)
    VALUES (
        v_user_id,
        183,
        5,
        'Fantastic tour package! We added the candlelight dinner addon and it was so romantic - perfect for our honeymoon. The ayurvedic spa treatment was heavenly and helped us relax after the long flight. Our guide was attentive and made sure we had everything we needed. The wildlife safari was thrilling! Best vacation ever!',
        true,
        CURRENT_DATE - INTERVAL '50 days',
        true,
        31,
        CURRENT_DATE - INTERVAL '48 days'
    );

    SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
    INSERT INTO reviews (user_id, tour_id, rating, review_text, is_approved, travel_date, verified_purchase, helpful_count, submission_date)
    VALUES (
        v_user_id,
        183,
        4,
        'Really enjoyed this tour! We opted for the private guide which was worth it - got so much more personalized attention. The boat ride through mangroves was peaceful. Food was excellent throughout. Only complaint is that some locations were crowded. Overall a wonderful experience that showcased the best of South India.',
        true,
        CURRENT_DATE - INTERVAL '15 days',
        true,
        10,
        CURRENT_DATE - INTERVAL '13 days'
    );

    -- Reviews supplémentaires pour d'autres tours
    SELECT id INTO v_user_id FROM users WHERE role = 'user' ORDER BY RANDOM() LIMIT 1;
    INSERT INTO reviews (user_id, tour_id, rating, review_text, is_approved, travel_date, verified_purchase, helpful_count, submission_date)
    VALUES (
        v_user_id,
        81,
        5,
        'An incredible journey through South India! Every destination was unique and beautiful. The accommodations were comfortable, transportation was smooth, and our tour coordinator was excellent. We especially loved the temple architecture and the coastal villages. This tour gave us a perfect introduction to Indian culture and hospitality.',
        true,
        CURRENT_DATE - INTERVAL '70 days',
        true,
        17,
        CURRENT_DATE - INTERVAL '68 days'
    );

    RAISE NOTICE 'Successfully inserted 10 realistic reviews';
END $$;
