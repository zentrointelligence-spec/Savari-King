-- Migration: Remove PDF columns from database
-- Date: 2025-01-14
-- Description: Remove quote_detailed_pdf and quote_general_pdf columns from bookings and booking_quote_revisions tables
--              These columns are no longer needed after implementing web-based quote pages

-- ============================================
-- 1. Drop dependent views first
-- ============================================

-- Drop views that depend on the PDF columns
DROP VIEW IF EXISTS booking_details_enriched CASCADE;
DROP VIEW IF EXISTS booking_history_enriched CASCADE;

SELECT 'Dependent views dropped successfully' AS status;

-- ============================================
-- 2. Remove PDF columns from bookings table
-- ============================================

-- Check if columns exist before dropping them
DO $$
BEGIN
    -- Drop quote_detailed_pdf column if it exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'bookings'
        AND column_name = 'quote_detailed_pdf'
    ) THEN
        ALTER TABLE bookings DROP COLUMN quote_detailed_pdf;
        RAISE NOTICE 'Column quote_detailed_pdf dropped from bookings table';
    ELSE
        RAISE NOTICE 'Column quote_detailed_pdf does not exist in bookings table';
    END IF;

    -- Drop quote_general_pdf column if it exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'bookings'
        AND column_name = 'quote_general_pdf'
    ) THEN
        ALTER TABLE bookings DROP COLUMN quote_general_pdf;
        RAISE NOTICE 'Column quote_general_pdf dropped from bookings table';
    ELSE
        RAISE NOTICE 'Column quote_general_pdf does not exist in bookings table';
    END IF;
END $$;

-- ============================================
-- 3. Remove PDF columns from booking_quote_revisions table
-- ============================================

DO $$
BEGIN
    -- Drop quote_detailed_pdf column if it exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'booking_quote_revisions'
        AND column_name = 'quote_detailed_pdf'
    ) THEN
        ALTER TABLE booking_quote_revisions DROP COLUMN quote_detailed_pdf;
        RAISE NOTICE 'Column quote_detailed_pdf dropped from booking_quote_revisions table';
    ELSE
        RAISE NOTICE 'Column quote_detailed_pdf does not exist in booking_quote_revisions table';
    END IF;

    -- Drop quote_general_pdf column if it exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'booking_quote_revisions'
        AND column_name = 'quote_general_pdf'
    ) THEN
        ALTER TABLE booking_quote_revisions DROP COLUMN quote_general_pdf;
        RAISE NOTICE 'Column quote_general_pdf dropped from booking_quote_revisions table';
    ELSE
        RAISE NOTICE 'Column quote_general_pdf does not exist in booking_quote_revisions table';
    END IF;
END $$;

-- ============================================
-- 4. Verify the changes
-- ============================================

-- Check remaining columns in bookings table
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

-- Check remaining columns in booking_quote_revisions table
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'booking_quote_revisions'
ORDER BY ordinal_position;

-- ============================================
-- 5. Recreate views without PDF columns
-- ============================================

-- Recreate booking_details_enriched view
CREATE OR REPLACE VIEW booking_details_enriched AS
SELECT
  b.*,
  u.full_name as user_name,
  u.email as user_email,
  t.name as tour_name,
  t.duration_days,
  t.destinations,
  t.main_image_url as tour_image,
  pt.tier_name,
  pt.price as tier_price,
  CASE
    WHEN b.status = 'Inquiry Pending' THEN 'warning'
    WHEN b.status = 'Under Review' THEN 'info'
    WHEN b.status = 'Quote Sent' THEN 'success'
    WHEN b.status = 'Quote Expired' THEN 'danger'
    WHEN b.status = 'Payment Confirmed' THEN 'primary'
    WHEN b.status = 'Cancelled' THEN 'danger'
    WHEN b.status = 'Trip Completed' THEN 'secondary'
    ELSE 'default'
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
  END as quote_is_valid,
  CASE
    WHEN b.status = 'Under Review' AND
         EXISTS (
           SELECT 1 FROM booking_quote_revisions qr
           WHERE qr.booking_id = b.id
           AND qr.review_status IN ('draft', 'in_review', 'validated')
         )
    THEN true
    ELSE false
  END as has_active_review,
  (
    SELECT qr.id
    FROM booking_quote_revisions qr
    WHERE qr.booking_id = b.id
    AND qr.review_status IN ('draft', 'in_review', 'validated')
    ORDER BY qr.created_at DESC
    LIMIT 1
  ) as current_review_id,
  (
    SELECT u2.full_name
    FROM booking_quote_revisions qr
    LEFT JOIN users u2 ON qr.admin_id = u2.id
    WHERE qr.booking_id = b.id
    AND qr.review_status IN ('draft', 'in_review', 'validated')
    ORDER BY qr.created_at DESC
    LIMIT 1
  ) as reviewing_admin_name
FROM bookings b
LEFT JOIN users u ON b.user_id = u.id
LEFT JOIN tours t ON b.tour_id = t.id
LEFT JOIN packagetiers pt ON b.tier_id = pt.id
ORDER BY b.created_at DESC;

COMMENT ON VIEW booking_details_enriched IS
  'Enriched booking data with user, tour, and package tier information. Includes business logic flags and review status.';

-- Recreate booking_history_enriched view
CREATE OR REPLACE VIEW booking_history_enriched AS
SELECT
  b.id,
  b.booking_reference,
  b.user_id,
  b.tour_id,
  b.tier_id,
  b.travel_date,
  b.num_adults,
  b.num_children,
  b.num_adults + b.num_children as total_participants,
  b.selected_addons,
  b.selected_vehicles,
  b.participant_ages,
  b.estimated_price,
  b.final_price,
  b.currency,
  b.status,
  b.inquiry_date,
  b.quote_sent_date,
  b.quote_expiration_date,
  b.payment_timestamp,
  b.cancellation_date,
  b.completion_date,
  b.payment_transaction_id,
  b.payment_method,
  b.contact_name,
  b.contact_email,
  b.contact_phone,
  b.special_requests,
  b.admin_notes,
  b.quote_details,
  b.quote_status,
  b.created_at,
  b.updated_at,
  u.full_name as user_name,
  u.email as user_email,
  u.phone as user_phone,
  u.country as user_country,
  t.name as tour_name,
  t.duration_days,
  t.destinations,
  t.main_image_url as tour_image,
  t.min_age as tour_min_age,
  t.max_group_size as tour_max_capacity,
  pt.tier_name,
  pt.price as tier_price,
  pt.hotel_type,
  CASE
    WHEN b.status = 'Inquiry Pending' THEN 'warning'
    WHEN b.status = 'Under Review' THEN 'info'
    WHEN b.status = 'Quote Sent' THEN 'success'
    WHEN b.status = 'Quote Expired' THEN 'danger'
    WHEN b.status = 'Payment Confirmed' THEN 'primary'
    WHEN b.status = 'Cancelled' THEN 'danger'
    WHEN b.status = 'Trip Completed' THEN 'secondary'
    ELSE 'default'
  END as status_color,
  CASE
    WHEN b.status = 'Under Review' THEN true
    ELSE false
  END as is_under_review,
  (
    SELECT qr.id
    FROM booking_quote_revisions qr
    WHERE qr.booking_id = b.id
    AND qr.review_status IN ('draft', 'in_review', 'validated')
    ORDER BY qr.created_at DESC
    LIMIT 1
  ) as active_review_id,
  (
    SELECT qr.validation_score
    FROM booking_quote_revisions qr
    WHERE qr.booking_id = b.id
    AND qr.review_status IN ('draft', 'in_review', 'validated')
    ORDER BY qr.created_at DESC
    LIMIT 1
  ) as review_validation_score
FROM bookings b
LEFT JOIN users u ON b.user_id = u.id
LEFT JOIN tours t ON b.tour_id = t.id
LEFT JOIN packagetiers pt ON b.tier_id = pt.id
ORDER BY b.created_at DESC;

COMMENT ON VIEW booking_history_enriched IS
  'Complete booking history with all related information (user, tour, tier, review status). Used for admin dashboard and reporting.';

-- ============================================
-- 6. Summary
-- ============================================

SELECT 'Migration completed successfully!' AS status;
SELECT 'PDF columns have been removed from bookings and booking_quote_revisions tables' AS message;
SELECT 'Views recreated without PDF column references' AS note;
SELECT 'Web-based quote pages are now the primary method for viewing quotes' AS final_note;
