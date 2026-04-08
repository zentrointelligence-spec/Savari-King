-- Migration: Add price_per_person field to addons table
-- This field determines if addon price should be multiplied by number of participants

-- Add the new column
ALTER TABLE addons
ADD COLUMN IF NOT EXISTS price_per_person BOOLEAN DEFAULT true;

-- Add comment to explain the field
COMMENT ON COLUMN addons.price_per_person IS
'If true, addon price is multiplied by number of participants. If false, price is fixed for the group.';

-- Set default values based on addon category
-- Dining, wellness, and adventure activities are typically per person
UPDATE addons
SET price_per_person = true
WHERE category IN ('dining', 'wellness', 'adventure', 'activities');

-- Photography, transportation, and equipment are typically fixed price for the group
UPDATE addons
SET price_per_person = false
WHERE category IN ('photography', 'transport', 'equipment');

-- Cultural experiences and guides can be per person
UPDATE addons
SET price_per_person = true
WHERE category IN ('cultural', 'guide');

-- Show the updated addons
SELECT id, name, category, price, price_per_person
FROM addons
ORDER BY category, name;
