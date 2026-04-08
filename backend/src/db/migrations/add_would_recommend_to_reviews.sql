-- Migration: Add would_recommend field to reviews table
-- Description: Adds a boolean field to track if users would recommend the tour
-- Date: 2025-01-06

-- Add would_recommend column
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS would_recommend BOOLEAN DEFAULT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_would_recommend ON reviews(would_recommend);

-- Update existing reviews based on rating (4+ stars = would recommend)
-- This is Option B: automatic calculation based on ratings
UPDATE reviews
SET would_recommend = CASE
    WHEN rating >= 4 THEN TRUE
    WHEN rating <= 2 THEN FALSE
    ELSE NULL
END
WHERE would_recommend IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN reviews.would_recommend IS 'Boolean indicating if the user would recommend this tour to others. Auto-calculated based on rating (>=4 stars = true, <=2 stars = false, 3 stars = null)';
