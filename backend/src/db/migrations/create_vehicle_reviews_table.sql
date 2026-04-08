-- Create vehicle_reviews table
CREATE TABLE IF NOT EXISTS vehicle_reviews (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(booking_id, vehicle_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicle_reviews_vehicle_id ON vehicle_reviews(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_reviews_booking_id ON vehicle_reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_reviews_user_id ON vehicle_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_reviews_rating ON vehicle_reviews(rating);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vehicle_review_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vehicle_review_timestamp
    BEFORE UPDATE ON vehicle_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_vehicle_review_updated_at();

-- Add trigger to update vehicle average rating when a review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_vehicle_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE vehicles
        SET
            avg_rating = (
                SELECT COALESCE(AVG(rating), 0)
                FROM vehicle_reviews
                WHERE vehicle_id = OLD.vehicle_id
            ),
            review_count = (
                SELECT COUNT(*)
                FROM vehicle_reviews
                WHERE vehicle_id = OLD.vehicle_id
            )
        WHERE id = OLD.vehicle_id;
        RETURN OLD;
    ELSE
        UPDATE vehicles
        SET
            avg_rating = (
                SELECT COALESCE(AVG(rating), 0)
                FROM vehicle_reviews
                WHERE vehicle_id = NEW.vehicle_id
            ),
            review_count = (
                SELECT COUNT(*)
                FROM vehicle_reviews
                WHERE vehicle_id = NEW.vehicle_id
            )
        WHERE id = NEW.vehicle_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Check if vehicles table has avg_rating and review_count columns, add if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'vehicles' AND column_name = 'avg_rating') THEN
        ALTER TABLE vehicles ADD COLUMN avg_rating NUMERIC(3,2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'vehicles' AND column_name = 'review_count') THEN
        ALTER TABLE vehicles ADD COLUMN review_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create trigger for vehicle rating stats
DROP TRIGGER IF EXISTS trigger_update_vehicle_stats ON vehicle_reviews;
CREATE TRIGGER trigger_update_vehicle_stats
    AFTER INSERT OR UPDATE OR DELETE ON vehicle_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_vehicle_rating_stats();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON vehicle_reviews TO postgres;
GRANT USAGE, SELECT ON SEQUENCE vehicle_reviews_id_seq TO postgres;

-- Add comment
COMMENT ON TABLE vehicle_reviews IS 'Stores vehicle reviews from users after completed bookings';
