-- Migration: Associate blog posts with categories
-- Date: 2025-11-17
-- Description: Create associations in blog_post_categories table

-- Insert blog-category associations
INSERT INTO blog_post_categories (blog_post_id, category_id)
VALUES
  -- ============================================
  -- TRAVEL GUIDES (Category ID: 1) - 7 blogs
  -- ============================================
  (144, 1), -- Kerala Backwaters
  (145, 1), -- Hampi
  (146, 1), -- Chennai
  (147, 1), -- Munnar
  (148, 1), -- Mahabalipuram
  (149, 1), -- Coorg
  (150, 1), -- Mysore

  -- ============================================
  -- TIPS & ADVICE (Category ID: 2) - 4 blogs
  -- ============================================
  (151, 2), -- First Timer's Guide
  (152, 2), -- Monsoon Magic
  (153, 2), -- Budget Travel $30/day
  (154, 2), -- Solo Female Travelers

  -- ============================================
  -- CULTURE & HISTORY (Category ID: 3) - 3 blogs
  -- ============================================
  (155, 3), -- Temples of Tamil Nadu
  (156, 3), -- Silk, Spices & Sandalwood
  (157, 3), -- Classical Arts

  -- ============================================
  -- FOOD & CUISINE (Category ID: 4) - 3 blogs
  -- ============================================
  (158, 4), -- Ultimate Food Guide
  (159, 4), -- Filter Coffee Culture
  (160, 4), -- Street Food Paradise

  -- ============================================
  -- ADVENTURE & ACTIVITIES (Category ID: 5) - 3 blogs
  -- ============================================
  (161, 5), -- Trekking Western Ghats
  (162, 5), -- Water Sports & Beach
  (163, 5)  -- Wildlife Safaris

ON CONFLICT (blog_post_id, category_id) DO NOTHING;

-- Verify associations
SELECT
  bc.name as category,
  COUNT(bpc.blog_post_id) as blog_count
FROM blog_categories bc
LEFT JOIN blog_post_categories bpc ON bc.id = bpc.category_id
GROUP BY bc.id, bc.name
ORDER BY bc.display_order;

-- Show all associations
SELECT
  bp.id,
  bp.title,
  bc.name as category
FROM blog_posts bp
JOIN blog_post_categories bpc ON bp.id = bpc.blog_post_id
JOIN blog_categories bc ON bpc.category_id = bc.id
ORDER BY bc.display_order, bp.id;
