-- ============================================================
-- Migration: Seed Vehicle Images
-- Date: 2025-10-11
-- Description:
--   Insert 4 high-quality images for each vehicle for carousel display
-- ============================================================

-- Vehicle 1: Sedan Confortable (Comfortable Sedan)
INSERT INTO vehicle_images (vehicle_id, image_url, display_order) VALUES
  (1, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80', 1),
  (1, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80', 2),
  (1, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80', 3),
  (1, 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80', 4)
ON CONFLICT (vehicle_id, display_order) DO NOTHING;

-- Vehicle 2: SUV Spacieux 7 Places (Spacious 7-Seater SUV)
INSERT INTO vehicle_images (vehicle_id, image_url, display_order) VALUES
  (2, 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80', 1),
  (2, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80', 2),
  (2, 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80', 3),
  (2, 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800&q=80', 4)
ON CONFLICT (vehicle_id, display_order) DO NOTHING;

-- Vehicle 3: Mini Bus 12 Places (12-Seater Minibus)
INSERT INTO vehicle_images (vehicle_id, image_url, display_order) VALUES
  (3, 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80', 1),
  (3, 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=800&q=80', 2),
  (3, 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80&fit=crop', 3),
  (3, 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80', 4)
ON CONFLICT (vehicle_id, display_order) DO NOTHING;

-- Vehicle 4: Van de Luxe 8 Places (Luxury 8-Seater Van)
INSERT INTO vehicle_images (vehicle_id, image_url, display_order) VALUES
  (4, 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800&q=80', 1),
  (4, 'https://images.unsplash.com/photo-1583878174843-4b0c9c7c2233?w=800&q=80', 2),
  (4, 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&q=80', 3),
  (4, 'https://images.unsplash.com/photo-1506015391300-1d46f1e5f38e?w=800&q=80', 4)
ON CONFLICT (vehicle_id, display_order) DO NOTHING;

-- Vehicle 5: Grand Bus 25 Places (Large 25-Seater Bus)
INSERT INTO vehicle_images (vehicle_id, image_url, display_order) VALUES
  (5, 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80', 1),
  (5, 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80', 2),
  (5, 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80', 3),
  (5, 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800&q=80', 4)
ON CONFLICT (vehicle_id, display_order) DO NOTHING;

-- Vehicle 6: Voiture Économique 4 Places (Economy 4-Seater Car)
INSERT INTO vehicle_images (vehicle_id, image_url, display_order) VALUES
  (6, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80', 1),
  (6, 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80', 2),
  (6, 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80', 3),
  (6, 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&q=80', 4)
ON CONFLICT (vehicle_id, display_order) DO NOTHING;

-- ============================================================
-- Verification Query
-- ============================================================

-- Verify all vehicles have 4 images
-- SELECT
--   v.id,
--   v.name,
--   COUNT(vi.id) as image_count
-- FROM vehicles v
-- LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
-- GROUP BY v.id, v.name
-- ORDER BY v.id;

-- ============================================================
-- Rollback (if needed)
-- ============================================================

-- To rollback this migration:
-- DELETE FROM vehicle_images WHERE vehicle_id IN (1, 2, 3, 4, 5, 6);
