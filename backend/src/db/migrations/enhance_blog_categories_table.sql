-- Migration: Améliorer la table blog_categories avec icon, color, display_order
-- Date: 2025-11-17
-- Description: Ajouter colonnes pour l'apparence et l'ordre des catégories

-- Ajouter colonnes manquantes
ALTER TABLE blog_categories
ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'fa-bookmark',
ADD COLUMN IF NOT EXISTS color VARCHAR(50) DEFAULT 'bg-gray-500',
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Créer index pour performance
CREATE INDEX IF NOT EXISTS idx_blog_categories_active ON blog_categories(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_blog_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_blog_categories_updated_at ON blog_categories;
CREATE TRIGGER trigger_blog_categories_updated_at
BEFORE UPDATE ON blog_categories
FOR EACH ROW EXECUTE FUNCTION update_blog_categories_updated_at();

-- Commentaires
COMMENT ON COLUMN blog_categories.icon IS 'FontAwesome icon name (e.g., fa-map, fa-utensils)';
COMMENT ON COLUMN blog_categories.color IS 'Tailwind CSS color class (e.g., bg-blue-500)';
COMMENT ON COLUMN blog_categories.display_order IS 'Order for displaying categories (lower = first)';
COMMENT ON COLUMN blog_categories.is_active IS 'Whether the category is active and visible';
