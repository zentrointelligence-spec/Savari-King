-- Live package prices (admin-editable without code deploys)
CREATE TABLE IF NOT EXISTS package_prices (
  id          SERIAL PRIMARY KEY,
  package_id  VARCHAR(60)  NOT NULL,
  tier        VARCHAR(20)  NOT NULL,   -- standard | comfort | premium
  price_inr   INTEGER      NOT NULL,
  is_active   BOOLEAN      DEFAULT true,
  updated_at  TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE (package_id, tier)
);

-- Live package availability / status
CREATE TABLE IF NOT EXISTS package_status (
  id               SERIAL PRIMARY KEY,
  package_id       VARCHAR(60)  NOT NULL UNIQUE,
  status           VARCHAR(20)  DEFAULT 'available',  -- available | limited | seasonal | unavailable
  status_note      TEXT,                              -- e.g. "Filling fast for Dec–Jan"
  availability_pct INTEGER      DEFAULT 100,          -- 0-100
  updated_at       TIMESTAMPTZ  DEFAULT NOW()
);

-- Seed base prices (matches hardcoded fallback in recommendationEngine.js)
INSERT INTO package_prices (package_id, tier, price_inr) VALUES
  ('southern-crown',        'standard', 28000),
  ('southern-crown',        'comfort',  42000),
  ('southern-crown',        'premium',  68000),
  ('coastal-trail',         'standard', 22000),
  ('spice-trail',           'standard', 55000),
  ('kk-day-trip',           'standard',  3500),
  ('kk-day-trip',           'comfort',   4500),
  ('trivandrum-day',        'standard',  4000),
  ('trivandrum-day',        'comfort',   5500),
  ('kk-trivandrum-2d',      'standard', 10000),
  ('kk-trivandrum-2d',      'comfort',  16000),
  ('kk-trivandrum-2d',      'premium',  28000),
  ('madurai-pilgrimage',    'standard',  9000),
  ('ooty-escape',           'standard', 24000),
  ('kodaikanal-getaway',    'standard', 18000),
  ('tamil-heritage-trail',  'standard', 48000),
  ('grand-south-india',     'standard', 88000)
ON CONFLICT (package_id, tier) DO NOTHING;

-- Seed default status (all available)
INSERT INTO package_status (package_id, status, status_note, availability_pct) VALUES
  ('southern-crown',        'available', NULL, 100),
  ('coastal-trail',         'available', NULL, 100),
  ('spice-trail',           'available', NULL, 100),
  ('kk-day-trip',           'available', NULL, 100),
  ('trivandrum-day',        'available', NULL, 100),
  ('kk-trivandrum-2d',      'available', NULL, 100),
  ('madurai-pilgrimage',    'available', NULL, 100),
  ('ooty-escape',           'available', NULL, 100),
  ('kodaikanal-getaway',    'available', NULL, 100),
  ('tamil-heritage-trail',  'available', NULL, 100),
  ('grand-south-india',     'available', NULL, 100)
ON CONFLICT (package_id) DO NOTHING;
