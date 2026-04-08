-- Migration: Add quote acceptance tracking
-- Date: 2025-01-12
-- Description: Add columns to track when and by whom a quote was accepted

-- Add columns for quote acceptance
ALTER TABLE booking_quote_revisions
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS accepted_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_quote_revisions_accepted
  ON booking_quote_revisions(accepted_at);

CREATE INDEX IF NOT EXISTS idx_quote_revisions_accepted_by
  ON booking_quote_revisions(accepted_by_user_id);

-- Add comments for documentation
COMMENT ON COLUMN booking_quote_revisions.accepted_at IS
  'Timestamp when the client accepted this quote revision';

COMMENT ON COLUMN booking_quote_revisions.accepted_by_user_id IS
  'User ID of the client who accepted this quote';

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'booking_quote_revisions'
  AND column_name IN ('accepted_at', 'accepted_by_user_id');
