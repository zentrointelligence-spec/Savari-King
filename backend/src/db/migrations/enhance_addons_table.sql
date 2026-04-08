-- =====================================================
-- Migration: Enhance addons table structure
-- Description: Add missing fields for comprehensive addon management
-- =====================================================

-- Add new columns to addons table
ALTER TABLE addons
ADD COLUMN IF NOT EXISTS original_price NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'gift',
ADD COLUMN IF NOT EXISTS duration VARCHAR(100),
ADD COLUMN IF NOT EXISTS features TEXT[],
ADD COLUMN IF NOT EXISTS availability VARCHAR(200),
ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 4.5,
ADD COLUMN IF NOT EXISTS popularity INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS is_best_value BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS per_person BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_addons_category ON addons(category);
CREATE INDEX IF NOT EXISTS idx_addons_active ON addons(is_active);
CREATE INDEX IF NOT EXISTS idx_addons_display_order ON addons(display_order, is_active);

-- Insert comprehensive addon data
INSERT INTO addons (
    name,
    price,
    original_price,
    description,
    category,
    icon,
    duration,
    features,
    availability,
    rating,
    popularity,
    is_best_value,
    per_person,
    display_order
) VALUES
-- Dining Experience
(
    'Romantic Candlelight Dinner',
    3500.00,
    4500.00,
    'An intimate beachfront dining experience with personalized menu, live acoustic music, and dedicated service under the stars',
    'dining',
    'utensils',
    '3 hours',
    ARRAY['Private beach setup', '3-course gourmet meal', 'Live music', 'Photographer included'],
    'Limited to 2 couples per evening',
    4.9,
    92,
    true,
    true,
    1
),
-- Guide Service
(
    'Expert Local Guide',
    6000.00,
    NULL,
    'Dedicated cultural expert with deep local knowledge, storytelling skills, and access to hidden gems throughout your journey',
    'guide',
    'user',
    'Full tour duration',
    ARRAY['Licensed professional', 'Multilingual', 'Photography assistance', 'Local connections'],
    'Subject to guide availability',
    4.7,
    78,
    false,
    false,
    2
),
-- Wellness & Spa
(
    'Premium Ayurvedic Spa Retreat',
    4000.00,
    NULL,
    'Traditional 2-hour rejuvenation therapy at a luxury wellness center with authentic Ayurvedic treatments and herbal oils',
    'wellness',
    'spa',
    '2.5 hours',
    ARRAY['Consultation with Ayurvedic doctor', 'Personalized treatment', 'Herbal steam bath', 'Relaxation area access'],
    'Advance booking required',
    4.8,
    87,
    false,
    true,
    3
),
-- Yoga & Meditation
(
    'Sunrise Yoga & Meditation',
    2500.00,
    3000.00,
    'Private morning yoga class with ocean view guided by certified instructor, including meditation and breathing exercises',
    'wellness',
    'leaf',
    '2 hours',
    ARRAY['Certified instructor', 'Ocean view location', 'Yoga mat provided', 'Healthy breakfast included'],
    'Weather dependent',
    4.6,
    65,
    false,
    true,
    4
),
-- Photography
(
    'Professional Photography Session',
    5500.00,
    NULL,
    'Capture your memories with a professional photographer who knows the best spots and lighting for stunning travel photos',
    'photography',
    'camera',
    '2 hours',
    ARRAY['2-hour session', '50+ edited photos', 'Multiple locations', 'Same-day preview'],
    'Book 24 hours in advance',
    4.8,
    71,
    false,
    false,
    5
),
-- Adventure Activities
(
    'Water Sports Package',
    4500.00,
    5500.00,
    'Full day of exciting water activities including jet skiing, parasailing, banana boat rides, and snorkeling',
    'adventure',
    'water',
    '6 hours',
    ARRAY['Safety equipment included', 'Professional instructors', 'All activities covered', 'Lunch included'],
    'Weather and tide dependent',
    4.7,
    88,
    true,
    true,
    6
),
-- Cultural Experience
(
    'Traditional Cultural Show & Dinner',
    3000.00,
    NULL,
    'Evening cultural performance featuring traditional dance, music, and storytelling followed by authentic local cuisine',
    'cultural',
    'theater-masks',
    '3 hours',
    ARRAY['Front row seating', 'Traditional dinner', 'Meet the artists', 'Cultural explanation'],
    'Shows on Tuesday, Thursday, Saturday',
    4.6,
    73,
    false,
    true,
    7
),
-- Transportation
(
    'Private Airport Transfer',
    2000.00,
    NULL,
    'Comfortable private vehicle transfer from airport to hotel with professional driver and meet & greet service',
    'transport',
    'car',
    'As per flight schedule',
    ARRAY['Professional driver', 'Flight tracking', 'Meet & greet', 'Bottled water provided'],
    'Book 48 hours in advance',
    4.9,
    95,
    false,
    false,
    8
);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_addons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_addons_timestamp ON addons;
CREATE TRIGGER trigger_update_addons_timestamp
    BEFORE UPDATE ON addons
    FOR EACH ROW
    EXECUTE FUNCTION update_addons_updated_at();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Addons table enhanced and populated successfully!';
END $$;
