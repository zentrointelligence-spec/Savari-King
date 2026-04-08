-- Migration: Update max_quantity values for all addons with coherent values
-- Purpose: Set appropriate maximum quantities based on addon type/category
--
-- Logic:
-- - Guides: max 1 (you don't need multiple guides)
-- - Photography sessions: max 1 (one session is enough)
-- - Airport transfers: max 2 (arrival + departure)
-- - Dining/Shows/Wellness: unlimited (NULL) - people might want multiple experiences
-- - Adventure activities: max 5 (reasonable limit for safety/logistics)

-- Guides: Maximum 1 per booking
UPDATE addons
SET max_quantity = 1
WHERE category = 'guide' OR name ILIKE '%guide%';

-- Photography sessions: Maximum 1 per booking
UPDATE addons
SET max_quantity = 1
WHERE category = 'photography' OR name ILIKE '%photography%' OR name ILIKE '%photo%';

-- Airport transfers: Maximum 2 per booking (arrival + departure)
UPDATE addons
SET max_quantity = 2
WHERE category = 'transport' OR name ILIKE '%transfer%' OR name ILIKE '%airport%';

-- Adventure activities: Maximum 5 per booking (for safety/logistics)
UPDATE addons
SET max_quantity = 5
WHERE category = 'adventure' OR name ILIKE '%sport%' OR name ILIKE '%adventure%';

-- Dining experiences: Unlimited (NULL)
UPDATE addons
SET max_quantity = NULL
WHERE category = 'dining' OR name ILIKE '%dinner%' OR name ILIKE '%meal%' OR name ILIKE '%lunch%';

-- Cultural shows: Unlimited (NULL)
UPDATE addons
SET max_quantity = NULL
WHERE category = 'cultural' OR name ILIKE '%show%' OR name ILIKE '%cultural%' OR name ILIKE '%performance%';

-- Wellness/Spa: Maximum 10 per booking (reasonable for group activities)
UPDATE addons
SET max_quantity = 10
WHERE category = 'wellness' OR name ILIKE '%spa%' OR name ILIKE '%yoga%' OR name ILIKE '%meditation%' OR name ILIKE '%ayurveda%';

-- Display the updated values
SELECT
    id,
    name,
    category,
    max_quantity,
    CASE
        WHEN max_quantity IS NULL THEN 'Unlimited'
        ELSE 'Max: ' || max_quantity::text
    END as quantity_limit
FROM addons
ORDER BY id;
