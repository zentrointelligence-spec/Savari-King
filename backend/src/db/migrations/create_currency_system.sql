-- ============================================================================
-- Migration: Currency Management System
-- Description: Creates tables for multi-currency support with dynamic exchange rates
-- Author: Claude Code
-- Date: 2025-10-01
-- ============================================================================

-- Table 1: Currencies - Supported currencies list
CREATE TABLE IF NOT EXISTS currencies (
    code VARCHAR(3) PRIMARY KEY,  -- ISO 4217 code (USD, EUR, GBP, etc.)
    name VARCHAR(50) NOT NULL,    -- Full name (US Dollar, Euro, etc.)
    symbol VARCHAR(10) NOT NULL,  -- Currency symbol ($, €, £, etc.)
    is_active BOOLEAN DEFAULT TRUE,
    is_base BOOLEAN DEFAULT FALSE, -- Mark base currency (USD)
    decimal_places SMALLINT DEFAULT 2, -- Number of decimal places
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Exchange Rates - Dynamic rates from API
CREATE TABLE IF NOT EXISTS exchange_rates (
    id SERIAL PRIMARY KEY,
    from_currency VARCHAR(3) NOT NULL REFERENCES currencies(code) ON DELETE CASCADE,
    to_currency VARCHAR(3) NOT NULL REFERENCES currencies(code) ON DELETE CASCADE,
    rate NUMERIC(18, 6) NOT NULL, -- Exchange rate with high precision
    source VARCHAR(50) DEFAULT 'API', -- 'API' or 'FALLBACK'
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(from_currency, to_currency)
);

-- Table 3: Currency Fallback Rates - Fixed rates as backup
CREATE TABLE IF NOT EXISTS currency_fallback_rates (
    id SERIAL PRIMARY KEY,
    from_currency VARCHAR(3) NOT NULL REFERENCES currencies(code) ON DELETE CASCADE,
    to_currency VARCHAR(3) NOT NULL REFERENCES currencies(code) ON DELETE CASCADE,
    fallback_rate NUMERIC(18, 6) NOT NULL,
    notes TEXT, -- Optional notes about the rate
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(from_currency, to_currency)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exchange_rates_from ON exchange_rates(from_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_to ON exchange_rates(to_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_updated ON exchange_rates(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_fallback_rates_from ON currency_fallback_rates(from_currency);
CREATE INDEX IF NOT EXISTS idx_fallback_rates_to ON currency_fallback_rates(to_currency);

-- Trigger to update updated_at on currencies
CREATE OR REPLACE FUNCTION update_currency_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER currency_updated_at_trigger
BEFORE UPDATE ON currencies
FOR EACH ROW
EXECUTE FUNCTION update_currency_updated_at();

-- Trigger to update updated_at on currency_fallback_rates
CREATE TRIGGER fallback_rates_updated_at_trigger
BEFORE UPDATE ON currency_fallback_rates
FOR EACH ROW
EXECUTE FUNCTION update_currency_updated_at();

-- Insert supported currencies
INSERT INTO currencies (code, name, symbol, is_base) VALUES
('USD', 'US Dollar', '$', TRUE),
('EUR', 'Euro', '€', FALSE),
('GBP', 'British Pound', '£', FALSE),
('JPY', 'Japanese Yen', '¥', FALSE),
('CNY', 'Chinese Yuan', '¥', FALSE),
('INR', 'Indian Rupee', '₹', FALSE),
('AUD', 'Australian Dollar', 'A$', FALSE),
('CAD', 'Canadian Dollar', 'C$', FALSE),
('CHF', 'Swiss Franc', 'CHF', FALSE),
('AED', 'UAE Dirham', 'د.إ', FALSE),
('MYR', 'Malaysian Ringgit', 'RM', FALSE)
ON CONFLICT (code) DO NOTHING;

-- Insert fallback rates (as of October 2025 - approximate values)
-- Base: 1 USD = X
INSERT INTO currency_fallback_rates (from_currency, to_currency, fallback_rate, notes) VALUES
-- USD to others
('USD', 'USD', 1.000000, 'Base currency'),
('USD', 'EUR', 0.920000, 'USD to Euro'),
('USD', 'GBP', 0.790000, 'USD to British Pound'),
('USD', 'JPY', 149.500000, 'USD to Japanese Yen'),
('USD', 'CNY', 7.250000, 'USD to Chinese Yuan'),
('USD', 'INR', 83.200000, 'USD to Indian Rupee'),
('USD', 'AUD', 1.530000, 'USD to Australian Dollar'),
('USD', 'CAD', 1.360000, 'USD to Canadian Dollar'),
('USD', 'CHF', 0.880000, 'USD to Swiss Franc'),
('USD', 'AED', 3.673000, 'USD to UAE Dirham'),
('USD', 'MYR', 4.680000, 'USD to Malaysian Ringgit'),

-- EUR to others
('EUR', 'USD', 1.087000, 'Euro to USD'),
('EUR', 'EUR', 1.000000, 'Euro to Euro'),
('EUR', 'GBP', 0.859000, 'Euro to British Pound'),
('EUR', 'JPY', 162.500000, 'Euro to Japanese Yen'),
('EUR', 'CNY', 7.880000, 'Euro to Chinese Yuan'),
('EUR', 'INR', 90.400000, 'Euro to Indian Rupee'),
('EUR', 'AUD', 1.663000, 'Euro to Australian Dollar'),
('EUR', 'CAD', 1.478000, 'Euro to Canadian Dollar'),
('EUR', 'CHF', 0.956000, 'Euro to Swiss Franc'),
('EUR', 'AED', 3.992000, 'Euro to UAE Dirham'),
('EUR', 'MYR', 5.087000, 'Euro to Malaysian Ringgit'),

-- GBP to others
('GBP', 'USD', 1.266000, 'British Pound to USD'),
('GBP', 'EUR', 1.164000, 'British Pound to Euro'),
('GBP', 'GBP', 1.000000, 'British Pound to British Pound'),
('GBP', 'JPY', 189.200000, 'British Pound to Japanese Yen'),
('GBP', 'CNY', 9.177000, 'British Pound to Chinese Yuan'),
('GBP', 'INR', 105.300000, 'British Pound to Indian Rupee'),
('GBP', 'AUD', 1.936000, 'British Pound to Australian Dollar'),
('GBP', 'CAD', 1.721000, 'British Pound to Canadian Dollar'),
('GBP', 'CHF', 1.114000, 'British Pound to Swiss Franc'),
('GBP', 'AED', 4.649000, 'British Pound to UAE Dirham'),
('GBP', 'MYR', 5.925000, 'British Pound to Malaysian Ringgit'),

-- INR to major currencies (important for this project)
('INR', 'USD', 0.012019, 'Indian Rupee to USD'),
('INR', 'EUR', 0.011060, 'Indian Rupee to Euro'),
('INR', 'GBP', 0.009496, 'Indian Rupee to British Pound'),
('INR', 'JPY', 1.797000, 'Indian Rupee to Japanese Yen'),
('INR', 'CNY', 0.087139, 'Indian Rupee to Chinese Yuan'),
('INR', 'INR', 1.000000, 'Indian Rupee to Indian Rupee'),
('INR', 'AUD', 0.018390, 'Indian Rupee to Australian Dollar'),
('INR', 'CAD', 0.016346, 'Indian Rupee to Canadian Dollar'),
('INR', 'CHF', 0.010577, 'Indian Rupee to Swiss Franc'),
('INR', 'AED', 0.044148, 'Indian Rupee to UAE Dirham'),
('INR', 'MYR', 0.056251, 'Indian Rupee to Malaysian Ringgit')
ON CONFLICT (from_currency, to_currency)
DO UPDATE SET
    fallback_rate = EXCLUDED.fallback_rate,
    updated_at = CURRENT_TIMESTAMP;

-- Comments for documentation
COMMENT ON TABLE currencies IS 'List of supported currencies for multi-currency pricing';
COMMENT ON TABLE exchange_rates IS 'Current exchange rates fetched from external API';
COMMENT ON TABLE currency_fallback_rates IS 'Fallback exchange rates when API is unavailable';
COMMENT ON COLUMN exchange_rates.source IS 'Source of the rate: API (from external service) or FALLBACK (from currency_fallback_rates)';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Currency system tables created successfully!';
    RAISE NOTICE '- currencies: % rows', (SELECT COUNT(*) FROM currencies);
    RAISE NOTICE '- currency_fallback_rates: % rows', (SELECT COUNT(*) FROM currency_fallback_rates);
END $$;
