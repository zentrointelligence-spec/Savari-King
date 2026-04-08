-- Migration: Add created_at column to notifications table
-- Date: 2025-01-15
-- Description: Add created_at timestamp to track when notification was created (different from sent_at)

-- Add created_at column with default to NOW()
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing rows to set created_at = sent_at for historical data
UPDATE notifications
SET created_at = sent_at
WHERE created_at IS NULL;

-- Create index on created_at for query performance
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

SELECT 'created_at column added successfully to notifications table' AS status;
