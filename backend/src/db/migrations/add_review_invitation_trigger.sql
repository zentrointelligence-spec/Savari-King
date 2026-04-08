-- Migration: Ajouter un trigger pour notifier l'application quand un booking est complété
-- Cela permettra d'envoyer automatiquement une invitation aux avis

-- Créer une table pour stocker les événements de completion (queue)
CREATE TABLE IF NOT EXISTS booking_completion_events (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITHOUT TIME ZONE,
    email_sent BOOLEAN DEFAULT FALSE,
    error_message TEXT
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_booking_completion_events_processed
    ON booking_completion_events(processed, created_at);
CREATE INDEX IF NOT EXISTS idx_booking_completion_events_booking
    ON booking_completion_events(booking_id);

-- Fonction trigger pour créer un événement quand un booking est complété
CREATE OR REPLACE FUNCTION notify_booking_completed()
RETURNS TRIGGER AS $$
BEGIN
    -- Si le status passe à 'Completed' et qu'il n'était pas 'Completed' avant
    IF NEW.status = 'Completed' AND (OLD.status IS NULL OR OLD.status != 'Completed') THEN
        -- Créer un événement de completion
        INSERT INTO booking_completion_events (booking_id, processed)
        VALUES (NEW.id, FALSE)
        ON CONFLICT DO NOTHING;  -- Éviter les doublons

        RAISE NOTICE 'Booking % marked as Completed. Review invitation event created.', NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_notify_booking_completed ON bookings;
CREATE TRIGGER trigger_notify_booking_completed
    AFTER INSERT OR UPDATE OF status ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION notify_booking_completed();

-- Fonction pour marquer un événement comme traité
CREATE OR REPLACE FUNCTION mark_completion_event_processed(
    p_event_id INTEGER,
    p_email_sent BOOLEAN DEFAULT TRUE,
    p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE booking_completion_events
    SET
        processed = TRUE,
        processed_at = CURRENT_TIMESTAMP,
        email_sent = p_email_sent,
        error_message = p_error_message
    WHERE id = p_event_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour récupérer les événements non traités
CREATE OR REPLACE FUNCTION get_pending_completion_events()
RETURNS TABLE (
    event_id INTEGER,
    booking_id INTEGER,
    user_email VARCHAR,
    tour_name VARCHAR,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        bce.id,
        b.id,
        u.email,
        t.name,
        bce.created_at
    FROM booking_completion_events bce
    INNER JOIN bookings b ON bce.booking_id = b.id
    INNER JOIN users u ON b.user_id = u.id
    INNER JOIN tours t ON b.tour_id = t.id
    WHERE bce.processed = FALSE
    ORDER BY bce.created_at ASC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- Afficher un résumé
SELECT 'Review invitation system created successfully' as status;

-- Créer un événement pour le booking test complété
INSERT INTO booking_completion_events (booking_id, processed)
SELECT id, FALSE
FROM bookings
WHERE status = 'Completed'
ON CONFLICT DO NOTHING;

SELECT
    'Events created' as status,
    COUNT(*) as total_events
FROM booking_completion_events;
