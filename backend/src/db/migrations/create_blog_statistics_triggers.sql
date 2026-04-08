-- Migration: Créer triggers pour mettre à jour automatiquement les statistiques des blog posts
-- Date: 2025-11-17
-- Description: Triggers pour like_count, comment_count, avg_rating, rating_count

-- ============================================
-- TRIGGER 1: Mettre à jour like_count
-- ============================================

CREATE OR REPLACE FUNCTION update_blog_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrémenter le compteur de likes
    UPDATE blog_posts
    SET like_count = like_count + 1
    WHERE id = NEW.blog_post_id;

  ELSIF TG_OP = 'DELETE' THEN
    -- Décrémenter le compteur de likes
    UPDATE blog_posts
    SET like_count = GREATEST(like_count - 1, 0)
    WHERE id = OLD.blog_post_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Supprimer trigger existant si présent
DROP TRIGGER IF EXISTS trigger_update_blog_like_count ON blog_likes;

-- Créer le trigger
CREATE TRIGGER trigger_update_blog_like_count
AFTER INSERT OR DELETE ON blog_likes
FOR EACH ROW EXECUTE FUNCTION update_blog_like_count();

-- ============================================
-- TRIGGER 2: Mettre à jour comment_count
-- ============================================

CREATE OR REPLACE FUNCTION update_blog_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.is_approved = true THEN
    -- Incrémenter si commentaire approuvé
    UPDATE blog_posts
    SET comment_count = comment_count + 1
    WHERE id = NEW.blog_post_id;

  ELSIF TG_OP = 'DELETE' AND OLD.is_approved = true THEN
    -- Décrémenter si commentaire approuvé supprimé
    UPDATE blog_posts
    SET comment_count = GREATEST(comment_count - 1, 0)
    WHERE id = OLD.blog_post_id;

  ELSIF TG_OP = 'UPDATE' AND NEW.is_approved != OLD.is_approved THEN
    -- Gérer changement de statut d'approbation
    IF NEW.is_approved THEN
      UPDATE blog_posts
      SET comment_count = comment_count + 1
      WHERE id = NEW.blog_post_id;
    ELSE
      UPDATE blog_posts
      SET comment_count = GREATEST(comment_count - 1, 0)
      WHERE id = NEW.blog_post_id;
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Supprimer trigger existant si présent
DROP TRIGGER IF EXISTS trigger_update_blog_comment_count ON blog_comments;

-- Créer le trigger
CREATE TRIGGER trigger_update_blog_comment_count
AFTER INSERT OR UPDATE OR DELETE ON blog_comments
FOR EACH ROW EXECUTE FUNCTION update_blog_comment_count();

-- ============================================
-- TRIGGER 3: Mettre à jour avg_rating et rating_count
-- ============================================

CREATE OR REPLACE FUNCTION update_blog_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
  post_id INTEGER;
BEGIN
  -- Déterminer l'ID du post concerné
  IF TG_OP = 'DELETE' THEN
    post_id := OLD.blog_post_id;
  ELSE
    post_id := NEW.blog_post_id;
  END IF;

  -- Mettre à jour les statistiques de rating
  UPDATE blog_posts
  SET
    avg_rating = (
      SELECT COALESCE(AVG(rating)::NUMERIC(3,2), 0.00)
      FROM blog_ratings
      WHERE blog_post_id = post_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM blog_ratings
      WHERE blog_post_id = post_id
    )
  WHERE id = post_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Supprimer trigger existant si présent
DROP TRIGGER IF EXISTS trigger_update_blog_rating_stats ON blog_ratings;

-- Créer le trigger
CREATE TRIGGER trigger_update_blog_rating_stats
AFTER INSERT OR UPDATE OR DELETE ON blog_ratings
FOR EACH ROW EXECUTE FUNCTION update_blog_rating_stats();

-- ============================================
-- COMMENTAIRES
-- ============================================

COMMENT ON FUNCTION update_blog_like_count() IS 'Updates like_count in blog_posts when likes are added/removed';
COMMENT ON FUNCTION update_blog_comment_count() IS 'Updates comment_count in blog_posts when approved comments are added/removed';
COMMENT ON FUNCTION update_blog_rating_stats() IS 'Updates avg_rating and rating_count in blog_posts when ratings are added/updated/removed';
