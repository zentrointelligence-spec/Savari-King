-- Script pour créer une réservation de test complétée pour l'utilisateur actuel
-- Remplacez [USER_EMAIL] par votre email de connexion

-- Étape 1 : Trouver votre user_id
-- SELECT id, email FROM users WHERE email = '[VOTRE_EMAIL]';

-- Étape 2 : Créer une réservation complétée
-- IMPORTANT : Remplacez les valeurs entre [] par les vôtres

INSERT INTO bookings (
    booking_reference,
    user_id,           -- REMPLACER par votre user_id
    tour_id,           -- Tour à évaluer (184 = Munnar Tea Gardens Tour)
    tier_id,           -- Tier du tour (1 = Standard)
    travel_date,
    num_adults,
    num_children,
    selected_addons,
    selected_vehicles,
    estimated_price,
    final_price,
    currency,
    status,            -- IMPORTANT : 'Trip Completed'
    completion_date,
    contact_name,
    contact_email,
    contact_phone
)
VALUES (
    'EB-TEST-' || FLOOR(RANDOM() * 1000000)::TEXT,  -- Référence aléatoire
    2,  -- CHANGER PAR VOTRE USER_ID (ex: 1 pour admin@test.com, 2 pour user@test.com)
    184,  -- Tour ID (Munnar Tea Gardens Tour)
    1,    -- Tier ID (Standard)
    CURRENT_DATE - INTERVAL '7 days',  -- Date de voyage (il y a 7 jours)
    2,    -- 2 adultes
    0,    -- 0 enfant
    '[{"addon_id": 4, "quantity": 1}, {"addon_id": 5, "quantity": 1}]'::jsonb,  -- Addons
    '[{"vehicle_id": 1, "quantity": 1}]'::jsonb,  -- Vehicles
    50000.00,  -- Prix estimé
    50000.00,  -- Prix final
    'INR',
    'Trip Completed',  -- STATUS IMPORTANT
    NOW(),             -- Date de complétion
    'Test User',
    'test@example.com',
    '+91 1234567890'
)
RETURNING id, booking_reference, user_id, status;

-- Vérifier la réservation créée
-- SELECT id, booking_reference, user_id, status FROM bookings WHERE status = 'Trip Completed' ORDER BY id DESC LIMIT 1;
