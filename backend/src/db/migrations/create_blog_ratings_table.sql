-- Migration: Créer table blog_ratings
-- Date: 2025-11-17
-- Description: Table pour les notes (1-5 étoiles) sur les articles de blog

-- Créer la table blog_ratings
CREATE TABLE IF NOT EXISTS blog_ratings (
  id SERIAL PRIMARY KEY,
  blog_post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Contrainte unique: un user ne peut noter un post qu'une seule fois
  CONSTRAINT uq_blog_ratings_post_user UNIQUE (blog_post_id, user_id)
);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_blog_ratings_post ON blog_ratings(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_ratings_user ON blog_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_ratings_rating ON blog_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_blog_ratings_created_at ON blog_ratings(created_at DESC);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_blog_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_blog_ratings_updated_at ON blog_ratings;
CREATE TRIGGER trigger_blog_ratings_updated_at
BEFORE UPDATE ON blog_ratings
FOR EACH ROW EXECUTE FUNCTION update_blog_ratings_updated_at();

-- Commentaires
COMMENT ON TABLE blog_ratings IS 'User ratings (1-5 stars) on blog posts';
COMMENT ON COLUMN blog_ratings.rating IS 'Rating value from 1 (worst) to 5 (best)';
COMMENT ON CONSTRAINT uq_blog_ratings_post_user ON blog_ratings IS 'A user can only rate a post once (but can update it)';
