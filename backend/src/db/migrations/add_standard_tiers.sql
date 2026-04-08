-- Migration: Add Standard tier for all tours that only have Premium and Luxury
-- This creates a more affordable entry-level option for all tours

-- For each tour, create a Standard tier with:
-- - Price approximately 65% of Premium price
-- - 3-Star accommodation
-- - Basic but comprehensive inclusions

INSERT INTO packagetiers (tour_id, tier_name, price, hotel_type, inclusions_summary, exclusions_summary, accommodation_name, accommodation_rating, accommodation_tags)
SELECT
    pt.tour_id,
    'Standard' as tier_name,
    ROUND(MIN(pt.price) * 0.65, 2) as price,  -- 65% of lowest (Premium) price
    '3-Star Hotel' as hotel_type,
    CASE
        -- Kanyakumari tours (tour_id = 1)
        WHEN pt.tour_id = 1 THEN ARRAY[
            '3 nights in comfortable 3-star hotel',
            'Daily breakfast included',
            'Shared AC vehicle for transfers',
            'Group tour guide (English)',
            'All entrance fees included',
            'Boat ride to Vivekananda Rock',
            'Sunset point visit',
            'Basic sightseeing package'
        ]
        -- Goa tours (tour_id = 6)
        WHEN pt.tour_id = 6 THEN ARRAY[
            '5 nights in comfortable 3-star hotel',
            'Daily breakfast included',
            'Shared transfers from airport',
            'Basic water sports package (2 activities)',
            'Group tour of Old Goa',
            'Beach access',
            'Spice plantation tour',
            'Standard room amenities'
        ]
        -- Other Goa tours (tour_id = 81)
        WHEN pt.tour_id = 81 THEN ARRAY[
            '3 nights in comfortable 3-star hotel',
            'Daily breakfast and dinner',
            'Shared transfers',
            'Group heritage tour',
            'Basic water sports (2 activities)',
            'River cruise (shared)',
            'Old Goa churches visit',
            'Standard amenities'
        ]
        -- Default template for all other tours
        ELSE ARRAY[
            'Comfortable 3-star accommodation',
            'Daily breakfast included',
            'Shared AC transportation',
            'Group tour guide (English-speaking)',
            'All major entrance fees',
            'Standard sightseeing activities',
            'Basic amenities',
            'Travel assistance'
        ]
    END as inclusions_summary,
    ARRAY[
        'International flights',
        'Travel insurance',
        'Personal expenses and tips',
        'Lunch and dinner (unless specified)',
        'Premium activities and excursions',
        'Alcoholic beverages',
        'Room service charges',
        'Additional water sports'
    ] as exclusions_summary,
    CASE
        WHEN pt.tour_id = 1 THEN 'Sea View Inn Kanyakumari'
        WHEN pt.tour_id = 6 THEN 'Goa Beach Comfort Inn'
        WHEN pt.tour_id = 81 THEN 'Coastal Stay Goa'
        ELSE 'Comfortable Tourist Hotel'
    END as accommodation_name,
    3.5 as accommodation_rating,
    ARRAY['Clean', 'Central Location', 'WiFi', 'AC Rooms', 'Restaurant'] as accommodation_tags
FROM packagetiers pt
WHERE pt.tier_name = 'Premium'
GROUP BY pt.tour_id
HAVING NOT EXISTS (
    SELECT 1 FROM packagetiers pt2
    WHERE pt2.tour_id = pt.tour_id
    AND pt2.tier_name = 'Standard'
);

-- Update the frontend display order by ensuring tiers are ordered correctly
-- (This is just informational - ordering happens in the query)
-- Standard (lowest price) -> Premium (medium price) -> Luxury (highest price)

-- Verification query (uncomment to run after migration):
-- SELECT tour_id, tier_name, price, hotel_type
-- FROM packagetiers
-- WHERE tour_id IN (1, 6, 81)
-- ORDER BY tour_id, price;
