-- Migration: Create booking_quote_revisions table for quote review and validation system
-- Date: 2025-01-18
-- Description: Implements a comprehensive quote review system for admins to validate and adjust
--              bookings before sending final quotes to customers

-- Drop table if exists (for development only - remove in production)
DROP TABLE IF EXISTS booking_quote_revisions CASCADE;

-- Create booking_quote_revisions table
CREATE TABLE booking_quote_revisions (
  id SERIAL PRIMARY KEY,

  -- Foreign keys
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

  -- Revision tracking
  revision_number INTEGER NOT NULL DEFAULT 1,

  -- ===== VALIDATION BY SECTION =====

  -- 1. TOUR & PACKAGE TIER VALIDATION
  tier_validated BOOLEAN DEFAULT false,
  tier_original_price DECIMAL(10,2),
  tier_adjusted_price DECIMAL(10,2),
  tier_adjustment_reason TEXT,
  tier_notes TEXT,
  tier_availability_confirmed BOOLEAN DEFAULT false,

  -- 2. VEHICLES VALIDATION
  vehicles_validated BOOLEAN DEFAULT false,
  vehicles_original JSONB DEFAULT '[]'::jsonb,
  -- Format: [{"id": 1, "name": "7 Seater SUV", "quantity": 2, "price_per_day": 3000, "capacity": 7}]

  vehicles_adjusted JSONB DEFAULT '[]'::jsonb,
  -- Format: Same as above but with admin adjustments

  vehicles_total_capacity INTEGER DEFAULT 0,
  vehicles_capacity_sufficient BOOLEAN DEFAULT false,
  vehicles_availability_confirmed BOOLEAN DEFAULT false,
  vehicles_notes TEXT,

  -- 3. ADD-ONS VALIDATION
  addons_validated BOOLEAN DEFAULT false,
  addons_original JSONB DEFAULT '[]'::jsonb,
  -- Format: [{"id": 1, "name": "Guided City Tour", "quantity": 2, "price": 2000}]

  addons_adjusted JSONB DEFAULT '[]'::jsonb,
  -- Format: Same as above but with admin adjustments

  addons_availability_confirmed BOOLEAN DEFAULT false,
  addons_conflicts JSONB DEFAULT '[]'::jsonb,
  -- Format: [{"addon_id": 3, "conflict_with": 5, "reason": "Mutually exclusive activities"}]

  addons_suggestions JSONB DEFAULT '[]'::jsonb,
  -- Format: [{"addon_id": 7, "name": "Traditional Dance Show", "reason": "Popular with this tour", "price": 1500}]

  addons_notes TEXT,

  -- 4. PARTICIPANTS & DATES VALIDATION
  participants_validated BOOLEAN DEFAULT false,
  dates_validated BOOLEAN DEFAULT false,

  age_requirements_met BOOLEAN DEFAULT true,
  age_violations JSONB DEFAULT '[]'::jsonb,
  -- Format: [{"participant": 2, "age": 14, "min_required": 16, "category": "teen"}]

  capacity_requirements_met BOOLEAN DEFAULT true,
  max_capacity_exceeded BOOLEAN DEFAULT false,

  seasonal_pricing_applied BOOLEAN DEFAULT false,
  seasonal_pricing_details JSONB,
  -- Format: {"season": "peak", "multiplier": 1.2, "period": "Dec-Jan"}

  participants_notes TEXT,
  dates_notes TEXT,

  -- ===== PRICING & ADJUSTMENTS =====

  -- Base calculations
  base_price DECIMAL(10,2) NOT NULL,
  vehicles_price DECIMAL(10,2) DEFAULT 0,
  addons_price DECIMAL(10,2) DEFAULT 0,
  subtotal_price DECIMAL(10,2) NOT NULL,

  -- Discounts
  discounts JSONB DEFAULT '[]'::jsonb,
  -- Format: [
  --   {
  --     "id": "disc_1",
  --     "type": "early_bird",
  --     "name": "Early Bird Discount",
  --     "amount": 5000,
  --     "percentage": 10,
  --     "reason": "Booking more than 30 days in advance",
  --     "auto_applied": true,
  --     "created_at": "2025-01-18T10:30:00Z"
  --   }
  -- ]

  total_discounts DECIMAL(10,2) DEFAULT 0,

  -- Additional fees
  additional_fees JSONB DEFAULT '[]'::jsonb,
  -- Format: [
  --   {
  --     "id": "fee_1",
  --     "type": "peak_season",
  --     "name": "Peak Season Surcharge",
  --     "amount": 3000,
  --     "percentage": null,
  --     "reason": "Travel during Christmas holidays",
  --     "auto_applied": true,
  --     "created_at": "2025-01-18T10:30:00Z"
  --   }
  -- ]

  total_fees DECIMAL(10,2) DEFAULT 0,

  -- Final pricing
  final_price DECIMAL(10,2) NOT NULL,

  -- Price comparison with original estimate
  original_estimated_price DECIMAL(10,2),
  price_difference DECIMAL(10,2),
  price_difference_percentage DECIMAL(5,2),

  -- Currency
  currency VARCHAR(3) DEFAULT 'INR',

  -- ===== MESSAGES & NOTES =====

  internal_notes TEXT,
  -- Private notes for admin team only

  customer_message TEXT,
  -- Personalized message to include in the quote email

  rejection_reason TEXT,
  -- Reason for rejecting the booking request

  -- ===== AUTOMATIC VALIDATION RESULTS =====

  auto_validation_results JSONB,
  -- Format: {
  --   "tier_available": true,
  --   "vehicles_available": true,
  --   "addons_available": true,
  --   "date_conflicts": [],
  --   "capacity_warnings": [],
  --   "age_warnings": [],
  --   "suggestions": {
  --     "upsell": [],
  --     "cross_sell": [],
  --     "vehicle_alternatives": []
  --   },
  --   "auto_discounts": [],
  --   "auto_fees": [],
  --   "validated_at": "2025-01-18T10:30:00Z"
  -- }

  validation_score INTEGER,
  -- Score from 0-100 based on how many validations passed

  -- ===== STATUS & WORKFLOW =====

  review_status VARCHAR(50) DEFAULT 'draft',
  -- Possible values: 'draft', 'in_review', 'validated', 'approved', 'rejected', 'sent'

  all_sections_validated BOOLEAN DEFAULT false,
  -- True only when tier, vehicles, addons, and participants are all validated

  ready_to_send BOOLEAN DEFAULT false,
  -- True when admin has approved and quote is ready to send

  -- ===== TIMESTAMPS =====

  review_started_at TIMESTAMP DEFAULT NOW(),
  review_completed_at TIMESTAMP,
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  quote_sent_at TIMESTAMP,

  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== INDEXES FOR PERFORMANCE =====

CREATE INDEX idx_quote_revisions_booking ON booking_quote_revisions(booking_id);
CREATE INDEX idx_quote_revisions_admin ON booking_quote_revisions(admin_id);
CREATE INDEX idx_quote_revisions_status ON booking_quote_revisions(review_status);
CREATE INDEX idx_quote_revisions_ready ON booking_quote_revisions(ready_to_send) WHERE ready_to_send = true;
CREATE INDEX idx_quote_revisions_created ON booking_quote_revisions(created_at DESC);

-- ===== UNIQUE CONSTRAINT =====

-- Ensure only one active revision per booking (can have multiple if they're historical)
CREATE UNIQUE INDEX idx_quote_revisions_active_booking
  ON booking_quote_revisions(booking_id)
  WHERE review_status IN ('draft', 'in_review', 'validated');

-- ===== TRIGGERS =====

-- Trigger to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_quote_revision_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();

  -- Auto-calculate if all sections are validated
  NEW.all_sections_validated := (
    NEW.tier_validated = true AND
    NEW.vehicles_validated = true AND
    NEW.addons_validated = true AND
    NEW.participants_validated = true AND
    NEW.dates_validated = true
  );

  -- Auto-calculate price difference
  IF NEW.original_estimated_price IS NOT NULL AND NEW.original_estimated_price > 0 THEN
    NEW.price_difference := NEW.final_price - NEW.original_estimated_price;
    NEW.price_difference_percentage :=
      ROUND(((NEW.final_price - NEW.original_estimated_price) / NEW.original_estimated_price * 100)::numeric, 2);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_quote_revision_timestamp
BEFORE UPDATE ON booking_quote_revisions
FOR EACH ROW
EXECUTE FUNCTION update_quote_revision_timestamp();

-- Trigger to set revision number on insert
CREATE OR REPLACE FUNCTION set_revision_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the next revision number for this booking
  SELECT COALESCE(MAX(revision_number), 0) + 1
  INTO NEW.revision_number
  FROM booking_quote_revisions
  WHERE booking_id = NEW.booking_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_revision_number
BEFORE INSERT ON booking_quote_revisions
FOR EACH ROW
EXECUTE FUNCTION set_revision_number();

-- ===== VIEWS =====

-- View for active (current) revisions only
CREATE OR REPLACE VIEW active_quote_revisions AS
SELECT
  qr.*,
  b.booking_reference,
  b.status as booking_status,
  b.travel_date,
  b.num_adults,
  b.num_children,
  u.full_name as admin_name,
  u.email as admin_email
FROM booking_quote_revisions qr
LEFT JOIN bookings b ON qr.booking_id = b.id
LEFT JOIN users u ON qr.admin_id = u.id
WHERE qr.review_status IN ('draft', 'in_review', 'validated', 'approved')
ORDER BY qr.created_at DESC;

-- View for revision history with enriched data
CREATE OR REPLACE VIEW quote_revision_history AS
SELECT
  qr.*,
  b.booking_reference,
  b.status as booking_status,
  b.contact_name,
  b.contact_email,
  t.name as tour_name,
  pt.tier_name,
  u.full_name as admin_name,
  CASE
    WHEN qr.review_status = 'draft' THEN 'secondary'
    WHEN qr.review_status = 'in_review' THEN 'info'
    WHEN qr.review_status = 'validated' THEN 'warning'
    WHEN qr.review_status = 'approved' THEN 'success'
    WHEN qr.review_status = 'rejected' THEN 'danger'
    WHEN qr.review_status = 'sent' THEN 'primary'
    ELSE 'default'
  END as status_color,
  CASE
    WHEN qr.price_difference > 0 THEN 'increased'
    WHEN qr.price_difference < 0 THEN 'decreased'
    ELSE 'unchanged'
  END as price_trend
FROM booking_quote_revisions qr
LEFT JOIN bookings b ON qr.booking_id = b.id
LEFT JOIN tours t ON b.tour_id = t.id
LEFT JOIN packagetiers pt ON b.tier_id = pt.id
LEFT JOIN users u ON qr.admin_id = u.id
ORDER BY qr.created_at DESC;

-- ===== FUNCTIONS =====

-- Function to calculate validation score
CREATE OR REPLACE FUNCTION calculate_revision_validation_score(revision_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  rev RECORD;
BEGIN
  SELECT * INTO rev FROM booking_quote_revisions WHERE id = revision_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Each validation adds 20 points (5 sections × 20 = 100)
  IF rev.tier_validated THEN score := score + 20; END IF;
  IF rev.vehicles_validated THEN score := score + 20; END IF;
  IF rev.addons_validated THEN score := score + 20; END IF;
  IF rev.participants_validated THEN score := score + 20; END IF;
  IF rev.dates_validated THEN score := score + 20; END IF;

  -- Update the score in the table
  UPDATE booking_quote_revisions SET validation_score = score WHERE id = revision_id;

  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- ===== COMMENTS FOR DOCUMENTATION =====

COMMENT ON TABLE booking_quote_revisions IS
  'Stores all quote revisions made by admins during the booking review process. Tracks validation status, price adjustments, and admin notes.';

COMMENT ON COLUMN booking_quote_revisions.revision_number IS
  'Sequential revision number for this booking (1, 2, 3...). Auto-incremented.';

COMMENT ON COLUMN booking_quote_revisions.review_status IS
  'Current status: draft, in_review, validated, approved, rejected, sent';

COMMENT ON COLUMN booking_quote_revisions.auto_validation_results IS
  'JSON object containing results of automatic validation checks and suggestions';

COMMENT ON COLUMN booking_quote_revisions.discounts IS
  'JSON array of applied discounts with details (type, amount, reason, auto_applied)';

COMMENT ON COLUMN booking_quote_revisions.additional_fees IS
  'JSON array of additional fees with details (type, amount, reason, auto_applied)';

COMMENT ON COLUMN booking_quote_revisions.validation_score IS
  'Score from 0-100 indicating how complete the validation is (20 points per section)';

-- ===== SAMPLE DATA FOR TESTING (Optional - comment out in production) =====

-- Example of inserting a revision for testing:
-- INSERT INTO booking_quote_revisions (
--   booking_id, admin_id, base_price, subtotal_price, final_price,
--   original_estimated_price, tier_validated
-- ) VALUES (
--   1, 1, 45000, 45000, 45000, 50000, true
-- );
