-- ============================================
-- ADDON AUTOMATIC METRICS UPDATE SYSTEM
-- ============================================
-- Description: Système de mise à jour automatique des métriques d'addons
--              (popularité et rating) basé sur les données réelles
-- Created: 2025-10-02
-- ============================================

-- ============================================
-- 1. TABLE: addon_reviews
-- ============================================
-- Permet aux utilisateurs de noter et commenter les addons
CREATE TABLE IF NOT EXISTS addon_reviews (
  id SERIAL PRIMARY KEY,
  addon_id INTEGER NOT NULL REFERENCES addons(id) ON DELETE CASCADE,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(booking_id, addon_id)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_addon_reviews_addon ON addon_reviews(addon_id);
CREATE INDEX IF NOT EXISTS idx_addon_reviews_rating ON addon_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_addon_reviews_user ON addon_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_addon_reviews_created ON addon_reviews(created_at DESC);

COMMENT ON TABLE addon_reviews IS 'Avis et notes des utilisateurs sur les addons';
COMMENT ON COLUMN addon_reviews.rating IS 'Note de 1 à 5 étoiles';
COMMENT ON COLUMN addon_reviews.comment IS 'Commentaire optionnel de l''utilisateur';

-- ============================================
-- 2. FONCTION: calculate_addon_popularity
-- ============================================
-- Calcule la popularité d'un addon basé sur les réservations
CREATE OR REPLACE FUNCTION calculate_addon_popularity(p_addon_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_total_bookings INTEGER;
  v_addon_selections INTEGER;
  v_popularity INTEGER;
BEGIN
  -- Compter les réservations confirmées/complétées qui incluent cet addon
  -- Le champ selected_addons est un JSONB array d'objets avec un champ 'id'
  SELECT COUNT(*)
  INTO v_addon_selections
  FROM bookings
  WHERE selected_addons IS NOT NULL
    AND selected_addons != 'null'::jsonb
    AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(selected_addons) AS addon
      WHERE (addon->>'id')::INTEGER = p_addon_id
    )
    AND status IN ('Confirmed', 'Completed');

  -- Compter le total de réservations confirmées/complétées pour les tours qui proposent cet addon
  SELECT COUNT(DISTINCT b.id)
  INTO v_total_bookings
  FROM bookings b
  INNER JOIN touraddons ta ON b.tour_id = ta.tour_id
  WHERE ta.addon_id = p_addon_id
    AND b.status IN ('Confirmed', 'Completed');

  -- Calcul du pourcentage de popularité
  IF v_total_bookings > 0 THEN
    v_popularity := ROUND((v_addon_selections::NUMERIC / v_total_bookings) * 100);
  ELSE
    -- Si aucune donnée, utiliser la valeur actuelle ou 50 par défaut
    SELECT COALESCE(popularity, 50) INTO v_popularity
    FROM addons WHERE id = p_addon_id;
  END IF;

  -- Limiter la valeur entre 0 et 100
  v_popularity := GREATEST(0, LEAST(100, v_popularity));

  RETURN v_popularity;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_addon_popularity(INTEGER) IS
'Calcule la popularité d''un addon en pourcentage basé sur les réservations confirmées';

-- ============================================
-- 3. FONCTION: calculate_addon_rating
-- ============================================
-- Calcule la note moyenne d'un addon basé sur les avis
CREATE OR REPLACE FUNCTION calculate_addon_rating(p_addon_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
  v_avg_rating NUMERIC;
  v_review_count INTEGER;
BEGIN
  -- Calculer la moyenne des avis et le nombre d'avis
  SELECT
    ROUND(AVG(rating)::NUMERIC, 2),
    COUNT(*)
  INTO v_avg_rating, v_review_count
  FROM addon_reviews
  WHERE addon_id = p_addon_id;

  -- Si pas d'avis, conserver la note actuelle ou utiliser 4.5 par défaut
  IF v_review_count = 0 THEN
    SELECT COALESCE(rating, 4.5) INTO v_avg_rating
    FROM addons WHERE id = p_addon_id;
  END IF;

  RETURN v_avg_rating;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_addon_rating(INTEGER) IS
'Calcule la note moyenne d''un addon basé sur les avis utilisateurs';

-- ============================================
-- 4. FONCTION: update_addon_metrics
-- ============================================
-- Met à jour les métriques (popularité et rating) d'un addon spécifique
CREATE OR REPLACE FUNCTION update_addon_metrics(p_addon_id INTEGER)
RETURNS VOID AS $$
DECLARE
  v_new_popularity INTEGER;
  v_new_rating NUMERIC;
BEGIN
  -- Calculer les nouvelles métriques
  v_new_popularity := calculate_addon_popularity(p_addon_id);
  v_new_rating := calculate_addon_rating(p_addon_id);

  -- Mettre à jour l'addon
  UPDATE addons
  SET
    popularity = v_new_popularity,
    rating = v_new_rating,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_addon_id;

  -- Log pour debugging (optionnel)
  RAISE NOTICE 'Addon % metrics updated: popularity=%, rating=%',
    p_addon_id, v_new_popularity, v_new_rating;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_addon_metrics(INTEGER) IS
'Met à jour la popularité et le rating d''un addon spécifique';

-- ============================================
-- 5. FONCTION: update_all_addon_metrics
-- ============================================
-- Met à jour les métriques de tous les addons actifs
CREATE OR REPLACE FUNCTION update_all_addon_metrics()
RETURNS TABLE(addon_id INTEGER, new_popularity INTEGER, new_rating NUMERIC) AS $$
DECLARE
  v_addon_record RECORD;
  v_updated_count INTEGER := 0;
BEGIN
  FOR v_addon_record IN SELECT id, name FROM addons WHERE is_active = true
  LOOP
    -- Mettre à jour les métriques
    PERFORM update_addon_metrics(v_addon_record.id);
    v_updated_count := v_updated_count + 1;

    -- Retourner les nouvelles valeurs
    RETURN QUERY
    SELECT
      v_addon_record.id,
      a.popularity,
      a.rating
    FROM addons a
    WHERE a.id = v_addon_record.id;
  END LOOP;

  RAISE NOTICE 'Updated metrics for % addons', v_updated_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_all_addon_metrics() IS
'Met à jour les métriques de tous les addons actifs et retourne les résultats';

-- ============================================
-- 6. TRIGGER: Mise à jour après modification de booking
-- ============================================
-- Fonction trigger pour mettre à jour les métriques quand une réservation change
CREATE OR REPLACE FUNCTION trigger_update_addon_metrics_on_booking()
RETURNS TRIGGER AS $$
DECLARE
  v_addon_id INTEGER;
  v_addon_ids_new INTEGER[] := ARRAY[]::INTEGER[];
  v_addon_ids_old INTEGER[] := ARRAY[]::INTEGER[];
  v_all_addon_ids INTEGER[];
BEGIN
  -- Extraire les IDs d'addons du JSONB (NEW)
  IF NEW.selected_addons IS NOT NULL AND NEW.selected_addons != 'null'::jsonb THEN
    SELECT ARRAY_AGG((jsonb_array_elements(NEW.selected_addons)->>'id')::INTEGER)
    INTO v_addon_ids_new
    FROM (SELECT NEW.selected_addons) AS subq;
  END IF;

  -- Extraire les IDs d'addons du JSONB (OLD) pour les UPDATE
  IF TG_OP = 'UPDATE' AND OLD.selected_addons IS NOT NULL AND OLD.selected_addons != 'null'::jsonb THEN
    SELECT ARRAY_AGG((jsonb_array_elements(OLD.selected_addons)->>'id')::INTEGER)
    INTO v_addon_ids_old
    FROM (SELECT OLD.selected_addons) AS subq;
  END IF;

  -- Combiner les IDs pour mettre à jour tous les addons concernés
  v_all_addon_ids := ARRAY(SELECT DISTINCT unnest(v_addon_ids_new || v_addon_ids_old));

  -- Mettre à jour les métriques uniquement si le statut est Confirmed ou Completed
  IF NEW.status IN ('Confirmed', 'Completed') AND v_all_addon_ids IS NOT NULL THEN
    FOREACH v_addon_id IN ARRAY v_all_addon_ids
    LOOP
      PERFORM update_addon_metrics(v_addon_id);
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_booking_addon_metrics ON bookings;
CREATE TRIGGER trigger_booking_addon_metrics
AFTER INSERT OR UPDATE OF status, selected_addons ON bookings
FOR EACH ROW
EXECUTE FUNCTION trigger_update_addon_metrics_on_booking();

COMMENT ON TRIGGER trigger_booking_addon_metrics ON bookings IS
'Met à jour automatiquement les métriques des addons quand une réservation est modifiée';

-- ============================================
-- 7. TRIGGER: Mise à jour après avis addon
-- ============================================
-- Fonction trigger pour mettre à jour le rating quand un avis est ajouté/modifié
CREATE OR REPLACE FUNCTION trigger_update_addon_rating_on_review()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_addon_metrics(NEW.addon_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_addon_review_rating ON addon_reviews;
CREATE TRIGGER trigger_addon_review_rating
AFTER INSERT OR UPDATE ON addon_reviews
FOR EACH ROW
EXECUTE FUNCTION trigger_update_addon_rating_on_review();

COMMENT ON TRIGGER trigger_addon_review_rating ON addon_reviews IS
'Met à jour automatiquement le rating d''un addon quand un avis est ajouté ou modifié';

-- ============================================
-- 8. TRIGGER: Mise à jour timestamp addon_reviews
-- ============================================
CREATE OR REPLACE FUNCTION update_addon_review_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_addon_review_timestamp ON addon_reviews;
CREATE TRIGGER trigger_update_addon_review_timestamp
BEFORE UPDATE ON addon_reviews
FOR EACH ROW
EXECUTE FUNCTION update_addon_review_updated_at();

-- ============================================
-- 9. VUES UTILES
-- ============================================

-- Vue pour les statistiques d'addons
CREATE OR REPLACE VIEW addon_statistics AS
SELECT
  a.id,
  a.name,
  a.category,
  a.price,
  a.popularity,
  a.rating,
  COUNT(DISTINCT ar.id) AS review_count,
  COUNT(DISTINCT b.id) AS booking_count,
  ROUND(AVG(ar.rating)::NUMERIC, 2) AS avg_review_rating
FROM addons a
LEFT JOIN addon_reviews ar ON a.id = ar.addon_id
LEFT JOIN bookings b ON b.selected_addons IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(b.selected_addons) AS addon
    WHERE (addon->>'id')::INTEGER = a.id
  )
  AND b.status IN ('Confirmed', 'Completed')
WHERE a.is_active = true
GROUP BY a.id, a.name, a.category, a.price, a.popularity, a.rating
ORDER BY a.popularity DESC, a.rating DESC;

COMMENT ON VIEW addon_statistics IS
'Vue récapitulative des statistiques de tous les addons actifs';

-- ============================================
-- 10. FONCTION UTILITAIRE: Rapport des métriques
-- ============================================
CREATE OR REPLACE FUNCTION get_addon_metrics_report()
RETURNS TABLE(
  addon_id INTEGER,
  addon_name VARCHAR,
  category VARCHAR,
  current_popularity INTEGER,
  calculated_popularity INTEGER,
  current_rating NUMERIC,
  calculated_rating NUMERIC,
  review_count BIGINT,
  booking_count BIGINT,
  needs_update BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.name,
    a.category,
    a.popularity,
    calculate_addon_popularity(a.id),
    a.rating,
    calculate_addon_rating(a.id),
    COUNT(DISTINCT ar.id),
    COUNT(DISTINCT b.id),
    (a.popularity != calculate_addon_popularity(a.id) OR
     a.rating != calculate_addon_rating(a.id)) AS needs_update
  FROM addons a
  LEFT JOIN addon_reviews ar ON a.id = ar.addon_id
  LEFT JOIN bookings b ON b.selected_addons IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(b.selected_addons) AS addon_elem
      WHERE (addon_elem->>'id')::INTEGER = a.id
    )
    AND b.status IN ('Confirmed', 'Completed')
  WHERE a.is_active = true
  GROUP BY a.id, a.name, a.category, a.popularity, a.rating
  ORDER BY needs_update DESC, a.popularity DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_addon_metrics_report() IS
'Génère un rapport comparatif entre les métriques actuelles et calculées';

-- ============================================
-- 11. PERMISSIONS (optionnel - à adapter selon votre système)
-- ============================================
-- GRANT SELECT, INSERT, UPDATE ON addon_reviews TO your_app_user;
-- GRANT SELECT ON addon_statistics TO your_app_user;
-- GRANT EXECUTE ON FUNCTION calculate_addon_popularity(INTEGER) TO your_app_user;
-- GRANT EXECUTE ON FUNCTION calculate_addon_rating(INTEGER) TO your_app_user;
-- GRANT EXECUTE ON FUNCTION update_addon_metrics(INTEGER) TO your_app_user;

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================

-- Log de succès
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration addon_automatic_metrics_system.sql completed successfully!';
  RAISE NOTICE 'New table created: addon_reviews';
  RAISE NOTICE 'Functions created: 7';
  RAISE NOTICE 'Triggers created: 3';
  RAISE NOTICE 'Views created: 1';
  RAISE NOTICE '========================================';
END $$;
