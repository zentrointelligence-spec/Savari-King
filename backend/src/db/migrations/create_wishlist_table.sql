-- ============================================================================
-- Migration: User Wishlist System
-- Description: Creates table for user wishlist (separate from favorites/likes)
-- Author: Claude Code
-- Date: 2025-10-01
-- ============================================================================

-- Table: user_wishlist
-- Purpose: Allow users to save tours for later (private list)
-- Difference from user_favorites: Favorites are "likes" (public stats), wishlist is private "save for later"
CREATE TABLE IF NOT EXISTS user_wishlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tour_id INTEGER NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    notes TEXT, -- Optional personal notes about why they saved this tour
    priority SMALLINT DEFAULT 0, -- Allow users to prioritize their wishlist items (0=normal, 1=high, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tour_id) -- Prevent duplicate entries
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON user_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_tour_id ON user_wishlist(tour_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_created ON user_wishlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_tour ON user_wishlist(user_id, tour_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_wishlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wishlist_updated_at_trigger
BEFORE UPDATE ON user_wishlist
FOR EACH ROW
EXECUTE FUNCTION update_wishlist_updated_at();

-- Verify/create user_favorites table structure if not exists
CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tour_id INTEGER NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tour_id)
);

-- Indexes for user_favorites (if not already present)
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_tour_id ON user_favorites(tour_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created ON user_favorites(created_at DESC);

-- Function to update tour_statistics.wishlist_count when favorites are added/removed
CREATE OR REPLACE FUNCTION update_tour_wishlist_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment wishlist_count when a favorite is added
        UPDATE tour_statistics
        SET wishlist_count = wishlist_count + 1
        WHERE tour_id = NEW.tour_id;

        -- Create statistics record if it doesn't exist
        INSERT INTO tour_statistics (tour_id, wishlist_count)
        VALUES (NEW.tour_id, 1)
        ON CONFLICT (tour_id) DO UPDATE
        SET wishlist_count = tour_statistics.wishlist_count + 1;

        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement wishlist_count when a favorite is removed
        UPDATE tour_statistics
        SET wishlist_count = GREATEST(wishlist_count - 1, 0)
        WHERE tour_id = OLD.tour_id;

        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on user_favorites if not exists
DROP TRIGGER IF EXISTS update_wishlist_count_trigger ON user_favorites;
CREATE TRIGGER update_wishlist_count_trigger
AFTER INSERT OR DELETE ON user_favorites
FOR EACH ROW
EXECUTE FUNCTION update_tour_wishlist_count();

-- Comments for documentation
COMMENT ON TABLE user_wishlist IS 'User wishlist for saving tours to review later (private)';
COMMENT ON TABLE user_favorites IS 'User favorites/likes for tours (affects public statistics)';
COMMENT ON COLUMN user_wishlist.notes IS 'Personal notes about the tour (visible only to the user)';
COMMENT ON COLUMN user_wishlist.priority IS 'Priority level: 0=normal, 1=high, 2=urgent';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Wishlist system created successfully!';
    RAISE NOTICE '- user_wishlist table created';
    RAISE NOTICE '- user_favorites table verified';
    RAISE NOTICE '- Triggers for wishlist_count synchronization created';
END $$;
