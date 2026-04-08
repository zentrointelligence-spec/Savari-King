-- Migration: Create destination_reviews table
-- Description: Table pour stocker les avis sur les destinations

-- Create destination_reviews table
CREATE TABLE IF NOT EXISTS destination_reviews (
    id SERIAL PRIMARY KEY,
    destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Un utilisateur ne peut laisser qu'un seul avis par destination et par réservation
    UNIQUE(booking_id, destination_id)
);

-- Create indexes
CREATE INDEX idx_destination_reviews_destination ON destination_reviews(destination_id);
CREATE INDEX idx_destination_reviews_user ON destination_reviews(user_id);
CREATE INDEX idx_destination_reviews_booking ON destination_reviews(booking_id);
CREATE INDEX idx_destination_reviews_rating ON destination_reviews(rating);
CREATE INDEX idx_destination_reviews_created ON destination_reviews(created_at DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_destination_review_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_destination_review_timestamp
    BEFORE UPDATE ON destination_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_destination_review_updated_at();

-- Trigger to update destination avg_rating and review_count
CREATE OR REPLACE FUNCTION update_destination_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
    dest_id INTEGER;
BEGIN
    -- Get the destination_id from OLD or NEW
    IF TG_OP = 'DELETE' THEN
        dest_id = OLD.destination_id;
    ELSE
        dest_id = NEW.destination_id;
    END IF;

    -- Update destination stats
    UPDATE destinations
    SET
        avg_rating = COALESCE(
            (SELECT ROUND(AVG(rating)::numeric, 2)
             FROM destination_reviews
             WHERE destination_id = dest_id),
            0.00
        ),
        review_count = COALESCE(
            (SELECT COUNT(*)
             FROM destination_reviews
             WHERE destination_id = dest_id),
            0
        )
    WHERE id = dest_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_destination_review_rating
    AFTER INSERT OR UPDATE OR DELETE ON destination_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_destination_rating_stats();

-- Comments
COMMENT ON TABLE destination_reviews IS 'Avis des utilisateurs sur les destinations';
COMMENT ON COLUMN destination_reviews.destination_id IS 'ID de la destination évaluée';
COMMENT ON COLUMN destination_reviews.booking_id IS 'ID de la réservation associée';
COMMENT ON COLUMN destination_reviews.user_id IS 'ID de l''utilisateur qui laisse l''avis';
COMMENT ON COLUMN destination_reviews.rating IS 'Note de 1 à 5 étoiles';
COMMENT ON COLUMN destination_reviews.comment IS 'Commentaire de l''utilisateur';
