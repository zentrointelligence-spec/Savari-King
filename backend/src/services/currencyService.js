// ============================================================================
// Currency Service
// Handles currency conversion with dynamic exchange rates from API
// Falls back to fixed rates when API is unavailable
// ============================================================================

const axios = require('axios');
const db = require('../db');

// ExchangeRate-API configuration
const EXCHANGE_API_BASE_URL = 'https://v6.exchangerate-api.com/v6';
const EXCHANGE_API_KEY = process.env.EXCHANGE_RATE_API_KEY || 'YOUR_API_KEY_HERE';

// Base currency (all prices in database are stored in INR)
const BASE_CURRENCY = 'USD';
const DB_CURRENCY = 'INR';

/**
 * Fetch latest exchange rates from ExchangeRate-API
 * @param {string} baseCurrency - Base currency code (default: USD)
 * @returns {Promise<Object>} Exchange rates object
 */
async function fetchExchangeRates(baseCurrency = BASE_CURRENCY) {
  try {
    const url = `${EXCHANGE_API_BASE_URL}/${EXCHANGE_API_KEY}/latest/${baseCurrency}`;
    const response = await axios.get(url, { timeout: 10000 });

    if (response.data && response.data.result === 'success') {
      return {
        success: true,
        base: response.data.base_code,
        rates: response.data.conversion_rates,
        timestamp: response.data.time_last_update_unix,
      };
    } else {
      throw new Error('Invalid API response');
    }
  } catch (error) {
    console.error('Error fetching exchange rates from API:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Update exchange rates in database from API
 * @returns {Promise<Object>} Update result
 */
async function updateExchangeRates() {
  try {
    console.log('📊 Updating exchange rates from API...');

    // Fetch rates from API
    const apiResult = await fetchExchangeRates(BASE_CURRENCY);

    if (!apiResult.success) {
      console.warn('⚠️  API fetch failed, rates not updated');
      return {
        success: false,
        message: 'API fetch failed',
        error: apiResult.error,
      };
    }

    const { rates } = apiResult;
    let updatedCount = 0;
    let errors = [];

    // Update each rate in database
    for (const [toCurrency, rate] of Object.entries(rates)) {
      try {
        await db.query(
          `INSERT INTO exchange_rates (from_currency, to_currency, rate, source, last_updated)
           VALUES ($1, $2, $3, 'API', CURRENT_TIMESTAMP)
           ON CONFLICT (from_currency, to_currency)
           DO UPDATE SET
             rate = EXCLUDED.rate,
             source = 'API',
             last_updated = CURRENT_TIMESTAMP`,
          [BASE_CURRENCY, toCurrency, rate]
        );
        updatedCount++;
      } catch (error) {
        errors.push({ currency: toCurrency, error: error.message });
      }
    }

    console.log(`✅ Updated ${updatedCount} exchange rates`);

    return {
      success: true,
      updatedCount,
      errors: errors.length > 0 ? errors : null,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('❌ Error updating exchange rates:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get exchange rate from database (with fallback)
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<number>} Exchange rate
 */
async function getExchangeRate(fromCurrency, toCurrency) {
  try {
    // Same currency = 1
    if (fromCurrency === toCurrency) {
      return 1.0;
    }

    // Try to get rate from exchange_rates table (API data)
    const result = await db.query(
      `SELECT rate, source, last_updated
       FROM exchange_rates
       WHERE from_currency = $1 AND to_currency = $2
       ORDER BY last_updated DESC
       LIMIT 1`,
      [fromCurrency, toCurrency]
    );

    if (result.rows.length > 0) {
      const { rate, source, last_updated } = result.rows[0];

      // Check if rate is too old (more than 24 hours)
      const ageInHours = (Date.now() - new Date(last_updated).getTime()) / (1000 * 60 * 60);

      if (ageInHours < 24 || source === 'FALLBACK') {
        return parseFloat(rate);
      }

      console.warn(`⚠️  Exchange rate ${fromCurrency}→${toCurrency} is ${ageInHours.toFixed(1)}h old`);
    }

    // Fallback to currency_fallback_rates
    console.log(`📌 Using fallback rate for ${fromCurrency}→${toCurrency}`);
    const fallbackResult = await db.query(
      `SELECT fallback_rate
       FROM currency_fallback_rates
       WHERE from_currency = $1 AND to_currency = $2`,
      [fromCurrency, toCurrency]
    );

    if (fallbackResult.rows.length > 0) {
      const fallbackRate = parseFloat(fallbackResult.rows[0].fallback_rate);

      // Store fallback rate in exchange_rates for future use
      await db.query(
        `INSERT INTO exchange_rates (from_currency, to_currency, rate, source, last_updated)
         VALUES ($1, $2, $3, 'FALLBACK', CURRENT_TIMESTAMP)
         ON CONFLICT (from_currency, to_currency)
         DO UPDATE SET
           rate = EXCLUDED.rate,
           source = 'FALLBACK',
           last_updated = CURRENT_TIMESTAMP
         WHERE exchange_rates.source != 'API'`,
        [fromCurrency, toCurrency, fallbackRate]
      );

      return fallbackRate;
    }

    // If still no rate found, try reverse rate (1 / rate)
    const reverseResult = await db.query(
      `SELECT rate FROM exchange_rates
       WHERE from_currency = $1 AND to_currency = $2
       UNION
       SELECT fallback_rate as rate FROM currency_fallback_rates
       WHERE from_currency = $1 AND to_currency = $2
       LIMIT 1`,
      [toCurrency, fromCurrency]
    );

    if (reverseResult.rows.length > 0) {
      const reverseRate = parseFloat(reverseResult.rows[0].rate);
      console.log(`🔄 Using reverse rate for ${fromCurrency}→${toCurrency}`);
      return 1 / reverseRate;
    }

    // Last resort: return 1 (no conversion)
    console.error(`❌ No exchange rate found for ${fromCurrency}→${toCurrency}`);
    return 1.0;
  } catch (error) {
    console.error('Error getting exchange rate:', error);
    return 1.0;
  }
}

/**
 * Convert price from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<number>} Converted amount
 */
async function convertPrice(amount, fromCurrency, toCurrency) {
  try {
    if (!amount || amount <= 0) {
      return 0;
    }

    const rate = await getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  } catch (error) {
    console.error('Error converting price:', error);
    return amount; // Return original amount on error
  }
}

/**
 * Convert price from INR (database currency) to target currency
 * @param {number} priceINR - Price in Indian Rupees
 * @param {string} targetCurrency - Target currency code
 * @returns {Promise<number>} Converted price
 */
async function convertFromINR(priceINR, targetCurrency) {
  if (targetCurrency === DB_CURRENCY) {
    return priceINR;
  }

  // Convert INR → USD → Target Currency
  const priceUSD = await convertPrice(priceINR, DB_CURRENCY, BASE_CURRENCY);
  const finalPrice = await convertPrice(priceUSD, BASE_CURRENCY, targetCurrency);

  return finalPrice;
}

/**
 * Get all active currencies
 * @returns {Promise<Array>} List of active currencies
 */
async function getActiveCurrencies() {
  try {
    const result = await db.query(
      `SELECT code, name, symbol, is_base, decimal_places
       FROM currencies
       WHERE is_active = TRUE
       ORDER BY is_base DESC, code ASC`
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting currencies:', error);
    return [];
  }
}

/**
 * Get all current exchange rates
 * @returns {Promise<Array>} List of exchange rates
 */
async function getAllExchangeRates() {
  try {
    const result = await db.query(
      `SELECT from_currency, to_currency, rate, source, last_updated
       FROM exchange_rates
       WHERE from_currency = $1
       ORDER BY to_currency ASC`,
      [BASE_CURRENCY]
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting exchange rates:', error);
    return [];
  }
}

/**
 * Format price with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - Currency code
 * @returns {Promise<string>} Formatted price string
 */
async function formatPrice(amount, currencyCode) {
  try {
    const result = await db.query(
      `SELECT symbol, decimal_places FROM currencies WHERE code = $1`,
      [currencyCode]
    );

    if (result.rows.length === 0) {
      return `${amount.toFixed(2)} ${currencyCode}`;
    }

    const { symbol, decimal_places } = result.rows[0];
    const formattedAmount = amount.toFixed(decimal_places || 2);

    // Format with thousand separators
    const parts = formattedAmount.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return `${symbol}${parts.join('.')}`;
  } catch (error) {
    console.error('Error formatting price:', error);
    return `${amount.toFixed(2)} ${currencyCode}`;
  }
}

module.exports = {
  fetchExchangeRates,
  updateExchangeRates,
  getExchangeRate,
  convertPrice,
  convertFromINR,
  getActiveCurrencies,
  getAllExchangeRates,
  formatPrice,
  BASE_CURRENCY,
  DB_CURRENCY,
};
