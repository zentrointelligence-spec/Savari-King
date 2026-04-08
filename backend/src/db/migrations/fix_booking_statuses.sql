-- Migration: Correction des statuses de bookings pour aligner avec Booking Flow PDF
-- Date: 2025-10-04
-- Description: Ajoute les statuses manquants et met à jour les bookings existants

-- Étape 1: Mettre à jour les valeurs existantes pour correspondre au nouveau format
-- 'confirmed' -> 'Payment Confirmed'
UPDATE bookings
SET status = 'Payment Confirmed'
WHERE LOWER(status) = 'confirmed';

-- Étape 2: Ajouter une contrainte CHECK pour les statuses autorisés
-- D'abord, supprimer toute contrainte existante sur status (si elle existe)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'bookings_status_check'
    ) THEN
        ALTER TABLE bookings DROP CONSTRAINT bookings_status_check;
    END IF;
END $$;

-- Ajouter la nouvelle contrainte avec tous les statuses valides
ALTER TABLE bookings
ADD CONSTRAINT bookings_status_check
CHECK (status IN (
    'Inquiry Pending',      -- Statut initial après soumission du formulaire
    'Quote Sent',           -- Devis envoyé par l'admin (valide 48h)
    'Payment Confirmed',    -- Paiement réussi, voyage confirmé
    'Cancelled',            -- Annulé (avant ou après paiement)
    'Completed'             -- Voyage terminé (marqué par admin)
));

-- Étape 3: Créer un index sur status pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_status_travel_date ON bookings(status, travel_date);

-- Étape 4: Ajouter un champ pour tracker la date de complétion
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITHOUT TIME ZONE;

-- Créer un commentaire pour documenter le champ
COMMENT ON COLUMN bookings.status IS 'Statut de la réservation: Inquiry Pending, Quote Sent, Payment Confirmed, Cancelled, Completed';
COMMENT ON COLUMN bookings.completed_at IS 'Date et heure où le voyage a été marqué comme complété par l''administrateur';

-- Étape 5: Créer une fonction trigger pour auto-remplir completed_at
CREATE OR REPLACE FUNCTION update_booking_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Si le status passe à 'Completed' et que completed_at n'est pas déjà défini
    IF NEW.status = 'Completed' AND OLD.status != 'Completed' AND NEW.completed_at IS NULL THEN
        NEW.completed_at := CURRENT_TIMESTAMP;
    END IF;

    -- Si le status quitte 'Completed', réinitialiser completed_at
    IF OLD.status = 'Completed' AND NEW.status != 'Completed' THEN
        NEW.completed_at := NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_booking_completed_at ON bookings;
CREATE TRIGGER trigger_booking_completed_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_booking_completed_at();

-- Afficher un résumé des changements
SELECT
    'Migration completed' as status,
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN status = 'Inquiry Pending' THEN 1 END) as inquiry_pending,
    COUNT(CASE WHEN status = 'Quote Sent' THEN 1 END) as quote_sent,
    COUNT(CASE WHEN status = 'Payment Confirmed' THEN 1 END) as payment_confirmed,
    COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as cancelled,
    COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed
FROM bookings;
