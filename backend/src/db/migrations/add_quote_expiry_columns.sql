-- Migration: Add missing quote expiry columns to bookings table
-- Date: 2025-10-19
-- Description: Adds quote_sent_at and quote_expiry_date columns for countdown timer functionality

-- Add quote_sent_at column (when the quote was sent to customer)
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS quote_sent_at TIMESTAMP;

-- Add quote_expiry_date column (48 hours after quote_sent_at)
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS quote_expiry_date TIMESTAMP;

-- Add index for efficient querying of expired quotes
CREATE INDEX IF NOT EXISTS idx_bookings_quote_expiry ON bookings(quote_expiry_date)
WHERE quote_expiry_date IS NOT NULL AND payment_status = 'pending';

-- Add comment for documentation
COMMENT ON COLUMN bookings.quote_sent_at IS 'Timestamp when the quote was sent to the customer';
COMMENT ON COLUMN bookings.quote_expiry_date IS 'Expiry date for the quote (typically 48 hours after quote_sent_at)';

-- Display success message
SELECT 'Migration completed: quote expiry columns added successfully' AS status;
