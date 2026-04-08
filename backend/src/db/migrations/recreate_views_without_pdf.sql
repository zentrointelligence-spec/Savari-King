-- Migration: Recreate views without PDF columns
-- Date: 2025-01-14
-- Description: Recreate booking_details_enriched and booking_history_enriched views
--              after removing PDF columns from bookings table

-- ============================================
-- 1. Recreate booking_details_enriched view
-- ============================================

DROP VIEW IF EXISTS booking_details_enriched CASCADE;

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

  -- Status color coding for UI
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

  -- Business logic flags
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

  -- Check if review is in progress
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

  -- Get current review ID if exists
  (
    SELECT qr.id
    FROM booking_quote_revisions qr
    WHERE qr.booking_id = b.id
    AND qr.review_status IN ('draft', 'in_review', 'validated')
    ORDER BY qr.created_at DESC
    LIMIT 1
  ) as current_review_id,

  -- Get admin who is reviewing
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

-- ============================================
-- 2. Recreate booking_history_enriched view
-- ============================================

DROP VIEW IF EXISTS booking_history_enriched CASCADE;

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

  -- User information
  u.full_name as user_name,
  u.email as user_email,
  u.phone as user_phone,
  u.country as user_country,

  -- Tour information
  t.name as tour_name,
  t.duration_days,
  t.destinations,
  t.main_image_url as tour_image,
  t.min_age as tour_min_age,
  t.max_group_size as tour_max_capacity,

  -- Package tier information
  pt.tier_name,
  pt.price as tier_price,
  pt.hotel_type,

  -- Status color for UI
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

  -- Review information
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
-- 3. Verification
-- ============================================

SELECT 'Views recreated successfully without PDF columns' AS status;
