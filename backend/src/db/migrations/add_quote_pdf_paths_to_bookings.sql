-- Migration: Add PDF paths for detailed and general quotes to bookings table
-- Created: 2025-10-16

-- Add columns for storing PDF paths
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS quote_detailed_pdf VARCHAR(500),
ADD COLUMN IF NOT EXISTS quote_general_pdf VARCHAR(500),
ADD COLUMN IF NOT EXISTS quote_status VARCHAR(50) DEFAULT 'pending';

-- Create index for quote status for faster filtering
CREATE INDEX IF NOT EXISTS idx_bookings_quote_status ON bookings(quote_status);

-- Add comment to columns
COMMENT ON COLUMN bookings.quote_detailed_pdf IS 'Path to the detailed quote PDF file';
COMMENT ON COLUMN bookings.quote_general_pdf IS 'Path to the general quote PDF file';
COMMENT ON COLUMN bookings.quote_status IS 'Status of quote: pending, sent, accepted, rejected, expired';

-- Update existing bookings with quote_sent_date to have quote_status = 'sent'
UPDATE bookings
SET quote_status = 'sent'
WHERE quote_sent_date IS NOT NULL;
