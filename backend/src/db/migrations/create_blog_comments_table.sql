-- Migration: Créer table blog_comments
-- Date: 2025-11-17
-- Description: Table pour les commentaires sur les articles de blog avec modération

-- Créer la table blog_comments
CREATE TABLE IF NOT EXISTS blog_comments (
  id SERIAL PRIMARY KEY,
  blog_post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id INTEGER REFERENCES blog_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Contraintes
  CONSTRAINT chk_comment_content_length CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 5000)
);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments(blog_post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user ON blog_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent ON blog_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_approved ON blog_comments(is_approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_approved ON blog_comments(blog_post_id, is_approved);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_blog_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_blog_comments_updated_at ON blog_comments;
CREATE TRIGGER trigger_blog_comments_updated_at
BEFORE UPDATE ON blog_comments
FOR EACH ROW EXECUTE FUNCTION update_blog_comments_updated_at();

-- Commentaires
COMMENT ON TABLE blog_comments IS 'User comments on blog posts with moderation support';
COMMENT ON COLUMN blog_comments.parent_comment_id IS 'For threaded comments (replies)';
COMMENT ON COLUMN blog_comments.is_approved IS 'Whether the comment has been approved by a moderator';
