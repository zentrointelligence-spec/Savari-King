-- Migration: Fix NULL titles and messages in notifications table
-- Author: Claude
-- Date: 2025-10-30
-- Description: Populate title and message fields for existing notifications based on their type

-- Update account_registered notifications
UPDATE notifications
SET
  title = 'Welcome to Ebenezer Tours! 🎉',
  message = 'Thank you for registering with us. We are excited to help you plan your next adventure!'
WHERE type = 'account_registered' AND (title IS NULL OR message IS NULL);

-- Update inquiry_received notifications
UPDATE notifications
SET
  title = 'New Inquiry Received',
  message = CONCAT(
    'We have received your inquiry for booking ',
    COALESCE((metadata->>'tour_name')::text, 'a tour'),
    '. Our team will review it and send you a personalized quote soon.'
  )
WHERE type = 'inquiry_received' AND (title IS NULL OR message IS NULL);

-- Update quote_sent notifications
UPDATE notifications
SET
  title = 'Your Quote is Ready! 📋',
  message = CONCAT(
    'Your personalized quote for ',
    COALESCE((metadata->>'tour_name')::text, 'your tour'),
    ' has been sent. Please review and proceed to payment.'
  )
WHERE type = 'quote_sent' AND (title IS NULL OR message IS NULL);

-- Update booking_cancelled notifications
UPDATE notifications
SET
  title = 'Booking Cancelled',
  message = CONCAT(
    'Your booking ',
    COALESCE((metadata->>'booking_reference')::text, '#' || booking_id::text),
    ' has been cancelled. If this was a mistake, please contact our support team.'
  )
WHERE type = 'booking_cancelled' AND (title IS NULL OR message IS NULL);

-- Update payment_confirmed notifications (if any exist)
UPDATE notifications
SET
  title = 'Payment Confirmed! 🎉',
  message = CONCAT(
    'Your payment for ',
    COALESCE((metadata->>'tour_name')::text, 'your tour'),
    ' has been confirmed. Get ready for an amazing adventure!'
  )
WHERE type = 'payment_confirmed' AND (title IS NULL OR message IS NULL);

-- Update trip_completed notifications (if any exist)
UPDATE notifications
SET
  title = 'Trip Completed! ⭐',
  message = CONCAT(
    'We hope you enjoyed your ',
    COALESCE((metadata->>'tour_name')::text, 'tour'),
    '! Please take a moment to leave a review and share your experience.'
  )
WHERE type = 'trip_completed' AND (title IS NULL OR message IS NULL);

-- Update quote_expiring_soon notifications (if any exist)
UPDATE notifications
SET
  title = 'Quote Expiring Soon! ⏰',
  message = CONCAT(
    'Your quote for ',
    COALESCE((metadata->>'tour_name')::text, 'your tour'),
    ' will expire in ',
    COALESCE((metadata->>'hours_remaining')::text, '24'),
    ' hours. Book now to secure your spot!'
  )
WHERE type = 'quote_expiring_soon' AND (title IS NULL OR message IS NULL);

-- Update quote_expired notifications (if any exist)
UPDATE notifications
SET
  title = 'Quote Expired',
  message = CONCAT(
    'Your quote for ',
    COALESCE((metadata->>'tour_name')::text, 'your tour'),
    ' has expired. Please request a new quote if you are still interested.'
  )
WHERE type = 'quote_expired' AND (title IS NULL OR message IS NULL);

-- Update quote_revision_sent notifications (if any exist)
UPDATE notifications
SET
  title = 'Revised Quote Available! 🎁',
  message = CONCAT(
    'We have sent you a revised quote for ',
    COALESCE((metadata->>'tour_name')::text, 'your tour'),
    ' with updated options. Please review the changes.'
  )
WHERE type = 'quote_revision_sent' AND (title IS NULL OR message IS NULL);

-- Update review_approved notifications (if any exist)
UPDATE notifications
SET
  title = 'Review Approved! ⭐',
  message = CONCAT(
    'Your review for ',
    COALESCE((metadata->>'tour_name')::text, 'the tour'),
    ' has been approved and is now visible to other travelers. Thank you for sharing your experience!'
  )
WHERE type = 'review_approved' AND (title IS NULL OR message IS NULL);

-- Update booking_reminder notifications (if any exist)
UPDATE notifications
SET
  title = 'Upcoming Trip Reminder! 🗓️',
  message = CONCAT(
    'Your trip to ',
    COALESCE((metadata->>'tour_name')::text, 'your destination'),
    ' is coming up in ',
    COALESCE((metadata->>'days_until_travel')::text, '7'),
    ' days. Make sure you have everything ready!'
  )
WHERE type = 'booking_reminder' AND (title IS NULL OR message IS NULL);

-- Add NOT NULL constraints to prevent future NULL values (optional, commented out)
-- ALTER TABLE notifications ALTER COLUMN title SET NOT NULL;
-- ALTER TABLE notifications ALTER COLUMN message SET NOT NULL;

-- Verification query
SELECT
  type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE title IS NOT NULL) as with_title,
  COUNT(*) FILTER (WHERE message IS NOT NULL) as with_message
FROM notifications
GROUP BY type
ORDER BY total DESC;
