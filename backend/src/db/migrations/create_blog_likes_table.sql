-- Migration: Créer table blog_likes
-- Date: 2025-11-17
-- Description: Table pour les likes sur les articles de blog

-- Créer la table blog_likes
CREATE TABLE IF NOT EXISTS blog_likes (
  id SERIAL PRIMARY KEY,
  blog_post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Contrainte unique: un user ne peut liker un post qu'une seule fois
  CONSTRAINT uq_blog_likes_post_user UNIQUE (blog_post_id, user_id)
);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_blog_likes_post ON blog_likes(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_user ON blog_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_created_at ON blog_likes(created_at DESC);

-- Commentaires
COMMENT ON TABLE blog_likes IS 'User likes on blog posts';
COMMENT ON CONSTRAINT uq_blog_likes_post_user ON blog_likes IS 'A user can only like a post once';
