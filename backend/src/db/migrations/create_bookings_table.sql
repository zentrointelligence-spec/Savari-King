-- Migration: Create bookings table with complete booking lifecycle support
-- Date: 2025-01-08
-- Description: Implements the complete booking lifecycle from inquiry to completion

-- Drop table if exists (for development only - remove in production)
DROP TABLE IF EXISTS bookings CASCADE;

-- Create bookings table
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  booking_reference VARCHAR(20) UNIQUE NOT NULL,

  -- Foreign keys
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tour_id INTEGER NOT NULL REFERENCES tours(id) ON DELETE RESTRICT,
  tier_id INTEGER NOT NULL REFERENCES packagetiers(id) ON DELETE RESTRICT,

  -- Travel details
  travel_date DATE NOT NULL,
  num_adults INTEGER NOT NULL DEFAULT 1 CHECK (num_adults > 0),
  num_children INTEGER DEFAULT 0 CHECK (num_children >= 0),

  -- Selections (stored as JSONB for flexibility)
  selected_addons JSONB DEFAULT '[]'::jsonb,
  -- Format: [{"id": 1, "name": "Candlelight Dinner", "price": 2500}, ...]

  selected_vehicles JSONB DEFAULT '[]'::jsonb,
  -- Format: [{"id": 1, "name": "7 Seater SUV", "quantity": 2, "price_per_day": 3000}, ...]

  -- Pricing
  estimated_price DECIMAL(10,2) NOT NULL,
  final_price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'INR',

  -- Status tracking
  status VARCHAR(50) DEFAULT 'Inquiry Pending',
  -- Possible values: 'Inquiry Pending', 'Quote Sent', 'Quote Expired',
  --                  'Payment Confirmed', 'Cancelled', 'Trip Completed'

  -- Timestamps for each status
  inquiry_date TIMESTAMP DEFAULT NOW(),
  quote_sent_date TIMESTAMP,
  quote_expiration_date TIMESTAMP,
  payment_timestamp TIMESTAMP,
  cancellation_date TIMESTAMP,
  completion_date TIMESTAMP,

  -- Payment details
  payment_transaction_id VARCHAR(255),
  payment_method VARCHAR(50),

  -- Contact information
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  special_requests TEXT,

  -- Admin management
  admin_notes TEXT,

  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_tour_id ON bookings(tour_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_travel_date ON bookings(travel_date);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);

-- Create a function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
  ref TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate reference: EB-YYYY-NNNNNN
    ref := 'EB-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 999999 + 1)::TEXT, 6, '0');

    -- Check if it already exists
    SELECT EXISTS(SELECT 1 FROM bookings WHERE booking_reference = ref) INTO exists;

    -- Exit loop if unique
    EXIT WHEN NOT exists;
  END LOOP;

  RETURN ref;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate booking reference
CREATE OR REPLACE FUNCTION set_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_reference IS NULL OR NEW.booking_reference = '' THEN
    NEW.booking_reference := generate_booking_reference();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_booking_reference
BEFORE INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION set_booking_reference();

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bookings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bookings_timestamp
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_bookings_timestamp();

-- Create a view for enriched booking data (useful for admin dashboard)
CREATE OR REPLACE VIEW booking_details_enriched AS
SELECT
  b.*,
  u.full_name as user_name,
  u.email as user_email,
  t.name as tour_name,
  t.duration_days,
  pt.tier_name,
  pt.price as tier_price,
  CASE
    WHEN b.status = 'Inquiry Pending' THEN 'warning'
    WHEN b.status = 'Quote Sent' THEN 'info'
    WHEN b.status = 'Payment Confirmed' THEN 'success'
    WHEN b.status = 'Cancelled' THEN 'danger'
    WHEN b.status = 'Trip Completed' THEN 'primary'
    ELSE 'secondary'
  END as status_color,
  CASE
    WHEN b.payment_timestamp IS NOT NULL AND
         b.status = 'Payment Confirmed' AND
         NOW() < (b.payment_timestamp + INTERVAL '24 hours')
    THEN true
    ELSE false
  END as can_cancel_with_refund,
  CASE
    WHEN b.quote_expiration_date IS NOT NULL AND
         b.status = 'Quote Sent' AND
         NOW() < b.quote_expiration_date
    THEN true
    ELSE false
  END as quote_is_valid
FROM bookings b
LEFT JOIN users u ON b.user_id = u.id
LEFT JOIN tours t ON b.tour_id = t.id
LEFT JOIN packagetiers pt ON b.tier_id = pt.id
ORDER BY b.created_at DESC;

-- Insert a comment for documentation
COMMENT ON TABLE bookings IS 'Stores all booking inquiries and their lifecycle from pending to completed';
COMMENT ON COLUMN bookings.status IS 'Current status: Inquiry Pending, Quote Sent, Quote Expired, Payment Confirmed, Cancelled, Trip Completed';
COMMENT ON COLUMN bookings.selected_addons IS 'JSONB array of selected add-ons with their details';
COMMENT ON COLUMN bookings.selected_vehicles IS 'JSONB array of additional vehicles with quantity';
COMMENT ON COLUMN bookings.booking_reference IS 'Unique reference for customer communication (format: EB-YYYY-NNNNNN)';

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON bookings TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE bookings_id_seq TO your_app_user;
