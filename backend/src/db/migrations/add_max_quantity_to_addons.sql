-- Migration: Add max_quantity field to addons table
-- Purpose: Allow controlling the maximum quantity of each addon that can be selected per booking
-- Example: Expert Local Guide might have max_quantity=1, while Traditional Show & Dinner can be unlimited (NULL)

-- Add max_quantity column (NULL means unlimited)
ALTER TABLE addons
ADD COLUMN IF NOT EXISTS max_quantity INTEGER DEFAULT NULL;

-- Add a comment explaining the field
COMMENT ON COLUMN addons.max_quantity IS 'Maximum quantity of this addon that can be selected per booking. NULL means unlimited.';

-- Example: Set max_quantity for specific addon types
-- UPDATE addons SET max_quantity = 1 WHERE name LIKE '%Guide%';
-- UPDATE addons SET max_quantity = NULL WHERE name LIKE '%Dinner%' OR name LIKE '%Show%';
