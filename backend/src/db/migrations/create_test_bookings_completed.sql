-- Créer des réservations de test complétées pour différents utilisateurs

-- Réservation pour admin@test.com (user_id: 1)
INSERT INTO bookings (
    booking_reference,
    user_id,
    tour_id,
    tier_id,
    travel_date,
    num_adults,
    num_children,
    selected_addons,
    selected_vehicles,
    estimated_price,
    final_price,
    currency,
    status,
    completion_date,
    contact_name,
    contact_email,
    contact_phone
)
VALUES (
    'EB-TEST-ADMIN',
    1,
    184,
    69,
    CURRENT_DATE - INTERVAL '7 days',
    2,
    1,
    '[{"addon_id": 4, "quantity": 1}, {"addon_id": 5, "quantity": 1}, {"addon_id": 8, "quantity": 1}]'::jsonb,
    '[{"vehicle_id": 1, "quantity": 1}]'::jsonb,
    50000.00,
    50000.00,
    'INR',
    'Trip Completed',
    NOW(),
    'Admin Test',
    'admin@test.com',
    '+91 9876543210'
);

-- Réservation pour user@test.com (user_id: 2)
INSERT INTO bookings (
    booking_reference,
    user_id,
    tour_id,
    tier_id,
    travel_date,
    num_adults,
    num_children,
    selected_addons,
    selected_vehicles,
    estimated_price,
    final_price,
    currency,
    status,
    completion_date,
    contact_name,
    contact_email,
    contact_phone
)
VALUES (
    'EB-TEST-USER',
    2,
    184,
    69,
    CURRENT_DATE - INTERVAL '5 days',
    3,
    0,
    '[{"addon_id": 4, "quantity": 1}, {"addon_id": 5, "quantity": 1}]'::jsonb,
    '[{"vehicle_id": 1, "quantity": 1}]'::jsonb,
    45000.00,
    45000.00,
    'INR',
    'Trip Completed',
    NOW(),
    'Test User',
    'user@test.com',
    '+91 9876543211'
);

-- Afficher les réservations créées
SELECT
    b.id,
    b.booking_reference,
    u.email,
    b.status
FROM bookings b
JOIN users u ON b.user_id = u.id
WHERE b.status = 'Trip Completed'
ORDER BY b.id DESC;
