// ============================================================================
// Currency Routes
// Routes for currency management and conversion
// ============================================================================

const express = require('express');
const currencyController = require('../controllers/currencyController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
// GET /api/currencies - Get all active currencies
router.get('/', currencyController.getCurrencies);

// GET /api/currencies/rates - Get all current exchange rates
router.get('/rates', currencyController.getExchangeRates);

// GET /api/currencies/convert?amount=100&from=USD&to=EUR - Convert currency
router.get('/convert', currencyController.convertCurrency);

// GET /api/currencies/rate/USD/EUR - Get specific exchange rate
router.get('/rate/:from/:to', currencyController.getSpecificRate);

// Admin routes (protected)
// POST /api/currencies/update-rates - Manually trigger rates update
router.post('/update-rates', protect, isAdmin, currencyController.updateRates);

module.exports = router;
