-- Fix: Corriger le trigger de mise à jour des métriques d'addons
-- Le trigger original avait un problème avec jsonb_array_elements dans ARRAY_AGG

DROP TRIGGER IF EXISTS trigger_booking_addon_metrics ON bookings;

CREATE OR REPLACE FUNCTION trigger_update_addon_metrics_on_booking()
RETURNS TRIGGER AS $$
DECLARE
  v_addon_id INTEGER;
  v_addon_ids_new INTEGER[];
  v_addon_ids_old INTEGER[];
  v_all_addon_ids INTEGER[];
BEGIN
  -- Extraire les IDs d'addons du JSONB (NEW)
  IF NEW.selected_addons IS NOT NULL AND NEW.selected_addons != 'null'::jsonb THEN
    SELECT ARRAY(
      SELECT (elem->>'id')::INTEGER
      FROM jsonb_array_elements(NEW.selected_addons) AS elem
    ) INTO v_addon_ids_new;
  END IF;

  -- Extraire les IDs d'addons du JSONB (OLD) pour les UPDATE
  IF TG_OP = 'UPDATE' AND OLD.selected_addons IS NOT NULL AND OLD.selected_addons != 'null'::jsonb THEN
    SELECT ARRAY(
      SELECT (elem->>'id')::INTEGER
      FROM jsonb_array_elements(OLD.selected_addons) AS elem
    ) INTO v_addon_ids_old;
  END IF;

  -- Combiner les IDs pour mettre à jour tous les addons concernés
  v_all_addon_ids := ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(v_addon_ids_new, ARRAY[]::INTEGER[]) ||
      COALESCE(v_addon_ids_old, ARRAY[]::INTEGER[])
    )
  );

  -- Mettre à jour les métriques uniquement si le statut est Confirmed ou Completed
  IF NEW.status IN ('Payment Confirmed', 'Completed') AND
     v_all_addon_ids IS NOT NULL AND
     array_length(v_all_addon_ids, 1) > 0 THEN
    FOREACH v_addon_id IN ARRAY v_all_addon_ids
    LOOP
      PERFORM update_addon_metrics(v_addon_id);
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_booking_addon_metrics
  AFTER INSERT OR UPDATE OF status, selected_addons ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_addon_metrics_on_booking();

SELECT 'Trigger fixed successfully' as status;
