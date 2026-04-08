-- Seed Data: Jeu de données de test pour le système de review d'addons
-- Date: 2025-10-04
-- Description: Crée des bookings avec différents statuses et des reviews pour tester le système complet

-- =====================================================================
-- ÉTAPE 1: Créer des bookings de test avec différents statuses
-- =====================================================================

-- Récupérer un utilisateur test (on prendra le premier utilisateur)
DO $$
DECLARE
    v_user_id INTEGER;
    v_tour_id INTEGER;
    v_package_id INTEGER;
    v_addon_ids INTEGER[];
    v_booking_id INTEGER;
    v_past_date DATE;
    v_future_date DATE;
BEGIN
    -- Sélectionner le premier utilisateur (role 'user' = customer)
    SELECT id INTO v_user_id FROM users WHERE role = 'user' LIMIT 1;

    -- Sélectionner le premier tour
    SELECT id INTO v_tour_id FROM tours WHERE is_active = true LIMIT 1;

    -- Sélectionner le premier package tier
    SELECT id INTO v_package_id FROM packagetiers WHERE tour_id = v_tour_id LIMIT 1;

    -- Récupérer les IDs des addons (on va utiliser les 4 premiers)
    SELECT ARRAY_AGG(id) INTO v_addon_ids
    FROM (SELECT id FROM addons WHERE is_active = true ORDER BY id LIMIT 4) sub;

    -- Dates de test
    v_past_date := CURRENT_DATE - INTERVAL '15 days';
    v_future_date := CURRENT_DATE + INTERVAL '30 days';

    RAISE NOTICE 'User ID: %, Tour ID: %, Package ID: %, Addon IDs: %',
        v_user_id, v_tour_id, v_package_id, v_addon_ids;

    -- =====================================================================
    -- BOOKING 1: Voyage COMPLÉTÉ il y a 15 jours (eligible pour reviews)
    -- =====================================================================
    INSERT INTO bookings (
        user_id,
        tour_id,
        package_tier_id,
        travel_date,
        number_of_persons,
        selected_addons,
        status,
        total_price,
        selected_currency,
        payment_timestamp,
        confirmed_at,
        completed_at
    ) VALUES (
        v_user_id,
        v_tour_id,
        v_package_id,
        v_past_date,
        2,
        jsonb_build_array(
            jsonb_build_object('id', v_addon_ids[1], 'name', 'Romantic Candlelight Dinner', 'quantity', 1),
            jsonb_build_object('id', v_addon_ids[2], 'name', 'Expert Local Guide', 'quantity', 2),
            jsonb_build_object('id', v_addon_ids[3], 'name', 'Premium Ayurvedic Spa Retreat', 'quantity', 1)
        ),
        'Completed',  -- ✅ Voyage terminé
        85000.00,
        'INR',
        CURRENT_TIMESTAMP - INTERVAL '20 days',  -- Payé il y a 20 jours
        CURRENT_TIMESTAMP - INTERVAL '20 days',
        CURRENT_TIMESTAMP - INTERVAL '2 days'     -- Complété il y a 2 jours
    ) RETURNING id INTO v_booking_id;

    RAISE NOTICE 'Created COMPLETED booking ID: %', v_booking_id;

    -- =====================================================================
    -- BOOKING 2: Voyage CONFIRMÉ mais dans le futur (pas encore eligible)
    -- =====================================================================
    INSERT INTO bookings (
        user_id,
        tour_id,
        package_tier_id,
        travel_date,
        number_of_persons,
        selected_addons,
        status,
        total_price,
        selected_currency,
        payment_timestamp,
        confirmed_at
    ) VALUES (
        v_user_id,
        v_tour_id,
        v_package_id,
        v_future_date,
        3,
        jsonb_build_array(
            jsonb_build_object('id', v_addon_ids[1], 'name', 'Romantic Candlelight Dinner', 'quantity', 1),
            jsonb_build_object('id', v_addon_ids[4], 'name', 'Sunrise Yoga & Meditation', 'quantity', 2)
        ),
        'Payment Confirmed',  -- ✅ Payé mais voyage futur
        95000.00,
        'INR',
        CURRENT_TIMESTAMP - INTERVAL '5 days',
        CURRENT_TIMESTAMP - INTERVAL '5 days'
    );

    -- =====================================================================
    -- BOOKING 3: Voyage CONFIRMÉ, date passée mais pas encore marqué Completed
    -- =====================================================================
    INSERT INTO bookings (
        user_id,
        tour_id,
        package_tier_id,
        travel_date,
        number_of_persons,
        selected_addons,
        status,
        total_price,
        selected_currency,
        payment_timestamp,
        confirmed_at
    ) VALUES (
        v_user_id,
        v_tour_id,
        v_package_id,
        CURRENT_DATE - INTERVAL '5 days',  -- Voyage il y a 5 jours
        2,
        jsonb_build_array(
            jsonb_build_object('id', v_addon_ids[2], 'name', 'Expert Local Guide', 'quantity', 1),
            jsonb_build_object('id', v_addon_ids[3], 'name', 'Premium Ayurvedic Spa Retreat', 'quantity', 2)
        ),
        'Payment Confirmed',  -- ⚠️ Pas encore marqué Completed (admin doit le faire)
        75000.00,
        'INR',
        CURRENT_TIMESTAMP - INTERVAL '10 days',
        CURRENT_TIMESTAMP - INTERVAL '10 days'
    );

    -- =====================================================================
    -- BOOKING 4: Devis envoyé (Quote Sent) - pas de paiement
    -- =====================================================================
    INSERT INTO bookings (
        user_id,
        tour_id,
        package_tier_id,
        travel_date,
        number_of_persons,
        selected_addons,
        status,
        total_price,
        selected_currency
    ) VALUES (
        v_user_id,
        v_tour_id,
        v_package_id,
        CURRENT_DATE + INTERVAL '45 days',
        4,
        jsonb_build_array(
            jsonb_build_object('id', v_addon_ids[1], 'name', 'Romantic Candlelight Dinner', 'quantity', 2)
        ),
        'Quote Sent',  -- ❌ Pas encore payé
        120000.00,
        'INR'
    );

    -- =====================================================================
    -- BOOKING 5: Demande en attente (Inquiry Pending)
    -- =====================================================================
    INSERT INTO bookings (
        user_id,
        tour_id,
        package_tier_id,
        travel_date,
        number_of_persons,
        selected_addons,
        status,
        selected_currency
    ) VALUES (
        v_user_id,
        v_tour_id,
        v_package_id,
        CURRENT_DATE + INTERVAL '60 days',
        2,
        jsonb_build_array(
            jsonb_build_object('id', v_addon_ids[3], 'name', 'Premium Ayurvedic Spa Retreat', 'quantity', 1)
        ),
        'Inquiry Pending',  -- ❌ Juste une demande
        'INR'
    );

END $$;

-- =====================================================================
-- ÉTAPE 2: Créer des avis de test pour le premier booking COMPLETED
-- =====================================================================

DO $$
DECLARE
    v_user_id INTEGER;
    v_booking_id INTEGER;
    v_addon_id INTEGER;
BEGIN
    -- Récupérer l'utilisateur et le booking complété
    SELECT u.id, b.id INTO v_user_id, v_booking_id
    FROM users u
    CROSS JOIN bookings b
    WHERE u.role = 'user'
      AND b.status = 'Completed'
    ORDER BY u.id, b.id
    LIMIT 1;

    -- Avis 1: Romantic Candlelight Dinner (5 étoiles)
    SELECT id INTO v_addon_id FROM addons WHERE name = 'Romantic Candlelight Dinner' LIMIT 1;

    INSERT INTO addon_reviews (
        addon_id,
        booking_id,
        user_id,
        rating,
        comment,
        created_at
    ) VALUES (
        v_addon_id,
        v_booking_id,
        v_user_id,
        5,
        'Absolutely magical experience! The candlelight dinner on the beach was unforgettable. The food was exquisite and the ambiance was perfect for our anniversary celebration.',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    );

    RAISE NOTICE 'Created review for Romantic Candlelight Dinner';

    -- Avis 2: Expert Local Guide (4 étoiles)
    SELECT id INTO v_addon_id FROM addons WHERE name = 'Expert Local Guide' LIMIT 1;

    INSERT INTO addon_reviews (
        addon_id,
        booking_id,
        user_id,
        rating,
        comment,
        created_at
    ) VALUES (
        v_addon_id,
        v_booking_id,
        v_user_id,
        4,
        'Our guide was very knowledgeable and spoke excellent English. He showed us hidden gems that we would never have found on our own. Highly recommend!',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    );

    RAISE NOTICE 'Created review for Expert Local Guide';

    -- Addon 3 reste sans avis (pour tester l'affichage "not reviewed yet")

END $$;

-- =====================================================================
-- ÉTAPE 3: Afficher un résumé des données créées
-- =====================================================================

-- Résumé des bookings
SELECT
    'BOOKINGS SUMMARY' as section,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed,
    COUNT(CASE WHEN status = 'Payment Confirmed' THEN 1 END) as payment_confirmed,
    COUNT(CASE WHEN status = 'Quote Sent' THEN 1 END) as quote_sent,
    COUNT(CASE WHEN status = 'Inquiry Pending' THEN 1 END) as inquiry_pending
FROM bookings;

-- Résumé des reviews
SELECT
    'REVIEWS SUMMARY' as section,
    COUNT(*) as total_reviews,
    COUNT(DISTINCT addon_id) as addons_reviewed,
    ROUND(AVG(rating)::NUMERIC, 2) as average_rating
FROM addon_reviews;

-- Détail des reviews par addon
SELECT
    a.name as addon_name,
    COUNT(ar.id) as review_count,
    ROUND(AVG(ar.rating)::NUMERIC, 2) as avg_rating,
    a.rating as stored_rating,
    a.popularity as popularity
FROM addons a
LEFT JOIN addon_reviews ar ON a.id = ar.addon_id
WHERE a.is_active = true
GROUP BY a.id, a.name, a.rating, a.popularity
ORDER BY review_count DESC;

-- Bookings éligibles pour reviews
SELECT
    'ELIGIBLE FOR REVIEWS' as info,
    COUNT(DISTINCT b.id) as eligible_bookings,
    COUNT(*) as total_addons_to_review
FROM bookings b
CROSS JOIN LATERAL (
    SELECT (elem->>'id')::INTEGER as addon_id
    FROM jsonb_array_elements(b.selected_addons) AS elem
) booking_addons
WHERE b.status IN ('Payment Confirmed', 'Completed')
  AND b.travel_date < CURRENT_DATE
  AND NOT EXISTS (
    SELECT 1 FROM addon_reviews ar
    WHERE ar.booking_id = b.id AND ar.addon_id = booking_addons.addon_id
  );
