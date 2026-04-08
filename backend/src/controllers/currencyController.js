// ============================================================================
// Currency Controller
// Handles HTTP requests for currency management and conversion
// ============================================================================

const currencyService = require('../services/currencyService');

/**
 * GET /api/currencies
 * Get all active currencies
 */
exports.getCurrencies = async (req, res) => {
  try {
    const currencies = await currencyService.getActiveCurrencies();

    res.status(200).json({
      success: true,
      count: currencies.length,
      data: currencies,
    });
  } catch (error) {
    console.error('Error getting currencies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve currencies',
    });
  }
};

/**
 * GET /api/currencies/rates
 * Get all current exchange rates (from base currency)
 */
exports.getExchangeRates = async (req, res) => {
  try {
    const rates = await currencyService.getAllExchangeRates();

    // Transform to simple object format
    const ratesObject = rates.reduce((acc, rate) => {
      acc[rate.to_currency] = {
        rate: parseFloat(rate.rate),
        source: rate.source,
        lastUpdated: rate.last_updated,
      };
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      base: currencyService.BASE_CURRENCY,
      count: rates.length,
      data: ratesObject,
    });
  } catch (error) {
    console.error('Error getting exchange rates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve exchange rates',
    });
  }
};

/**
 * GET /api/currencies/convert
 * Convert amount from one currency to another
 * Query params: amount, from, to
 */
exports.convertCurrency = async (req, res) => {
  try {
    const { amount, from, to } = req.query;

    // Validate inputs
    if (!amount || !from || !to) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: amount, from, to',
      });
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount: must be a positive number',
      });
    }

    // Convert
    const convertedAmount = await currencyService.convertPrice(amountNum, from.toUpperCase(), to.toUpperCase());

    // Get exchange rate used
    const rate = await currencyService.getExchangeRate(from.toUpperCase(), to.toUpperCase());

    res.status(200).json({
      success: true,
      data: {
        original: {
          amount: amountNum,
          currency: from.toUpperCase(),
        },
        converted: {
          amount: parseFloat(convertedAmount.toFixed(2)),
          currency: to.toUpperCase(),
        },
        rate: parseFloat(rate.toFixed(6)),
      },
    });
  } catch (error) {
    console.error('Error converting currency:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to convert currency',
    });
  }
};

/**
 * POST /api/currencies/update-rates
 * Manually trigger exchange rates update (admin only)
 */
exports.updateRates = async (req, res) => {
  try {
    const result = await currencyService.updateExchangeRates();

    if (result.success) {
      res.status(200).json({
        success: true,
        message: `Successfully updated ${result.updatedCount} exchange rates`,
        data: {
          updatedCount: result.updatedCount,
          timestamp: result.timestamp,
          errors: result.errors,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to update rates',
      });
    }
  } catch (error) {
    console.error('Error updating rates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update exchange rates',
    });
  }
};

/**
 * GET /api/currencies/rate/:from/:to
 * Get specific exchange rate between two currencies
 */
exports.getSpecificRate = async (req, res) => {
  try {
    const { from, to } = req.params;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: 'Missing currency codes',
      });
    }

    const rate = await currencyService.getExchangeRate(from.toUpperCase(), to.toUpperCase());

    res.status(200).json({
      success: true,
      data: {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        rate: parseFloat(rate.toFixed(6)),
      },
    });
  } catch (error) {
    console.error('Error getting specific rate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve exchange rate',
    });
  }
};
