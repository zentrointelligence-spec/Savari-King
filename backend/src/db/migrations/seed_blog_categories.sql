-- Migration: Seed des catégories initiales de blog
-- Date: 2025-11-17
-- Description: Insérer les 5 catégories principales pour le blog sur le Sud de l'Inde

-- Supprimer catégories existantes (si besoin de reset)
-- DELETE FROM blog_categories WHERE slug IN ('travel-guides', 'tips-advice', 'culture-history', 'food-cuisine', 'adventure-activities');

-- Insérer les 5 catégories principales
INSERT INTO blog_categories (name, slug, description, icon, color, display_order, is_active)
VALUES
  (
    'Travel Guides',
    'travel-guides',
    'Comprehensive travel guides for exploring South India destinations, attractions, and hidden gems',
    'fa-map',
    'bg-blue-500',
    1,
    true
  ),
  (
    'Tips & Advice',
    'tips-advice',
    'Practical travel tips, advice, and insider knowledge for South India travelers',
    'fa-lightbulb',
    'bg-yellow-500',
    2,
    true
  ),
  (
    'Culture & History',
    'culture-history',
    'Discover the rich cultural heritage, historical sites, and traditions of South India',
    'fa-landmark',
    'bg-purple-500',
    3,
    true
  ),
  (
    'Food & Cuisine',
    'food-cuisine',
    'Explore South Indian culinary delights, street food, regional specialties, and dining experiences',
    'fa-utensils',
    'bg-red-500',
    4,
    true
  ),
  (
    'Adventure & Activities',
    'adventure-activities',
    'Thrilling adventures, outdoor activities, and unique experiences across South India',
    'fa-hiking',
    'bg-green-500',
    5,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = CURRENT_TIMESTAMP;

-- Vérifier l'insertion
SELECT id, name, slug, icon, color, display_order
FROM blog_categories
ORDER BY display_order;
