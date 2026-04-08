-- Migration: Add applied_offers column to booking_quote_revisions and bookings tables
-- This allows automatic integration of special offers into quote revisions

-- Add applied_offers to booking_quote_revisions table
ALTER TABLE booking_quote_revisions
ADD COLUMN IF NOT EXISTS applied_offers JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the column
COMMENT ON COLUMN booking_quote_revisions.applied_offers IS 'Array of special offers applied to this revision: [{offer_id, offer_title, offer_type, discount_amount, discount_percentage, reason}]';

-- Add applied_offers to bookings table (for final confirmed bookings)
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS applied_offers JSONB DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN bookings.applied_offers IS 'Special offers that were applied to the final booking price';

-- Create index for querying by applied offers
CREATE INDEX IF NOT EXISTS idx_quote_revisions_applied_offers
ON booking_quote_revisions USING gin(applied_offers);

CREATE INDEX IF NOT EXISTS idx_bookings_applied_offers
ON bookings USING gin(applied_offers);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: applied_offers columns added successfully';
END $$;
