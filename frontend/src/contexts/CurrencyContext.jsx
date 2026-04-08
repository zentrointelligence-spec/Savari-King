import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_CONFIG from '../config/api';

export const CurrencyContext = createContext();

// Hook personnalisé pour utiliser le contexte de devise
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
];

const CACHE_KEY = 'currency_rates';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem('selected_currency') || 'USD';
  });

  const [exchangeRates, setExchangeRates] = useState(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { rates, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return rates;
      }
    }
    return {};
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch exchange rates from backend
  const fetchExchangeRates = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/currencies/rates`);

      if (response.data.success) {
        const rates = response.data.rates;
        setExchangeRates(rates);

        // Cache rates in localStorage
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          rates,
          timestamp: Date.now()
        }));
      }
    } catch (err) {
      console.error('Failed to fetch exchange rates:', err);
      setError(err.message);

      // If fetch fails and no cached rates, use fallback rates from backend
      if (Object.keys(exchangeRates).length === 0) {
        try {
          const fallbackResponse = await axios.get(`${API_CONFIG.BASE_URL}/api/currencies`);
          if (fallbackResponse.data.success) {
            // Set basic rates if available
            setExchangeRates(fallbackResponse.data.fallbackRates || {});
          }
        } catch (fallbackErr) {
          console.error('Failed to fetch fallback rates:', fallbackErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchExchangeRates();

    // Set up interval to refresh rates every 30 minutes
    const interval = setInterval(fetchExchangeRates, CACHE_DURATION);

    return () => clearInterval(interval);
  }, []);

  // Update localStorage when currency changes
  useEffect(() => {
    localStorage.setItem('selected_currency', selectedCurrency);
  }, [selectedCurrency]);

  // Listen for currency change events from AuthContext
  useEffect(() => {
    const handleCurrencyChange = (event) => {
      const newCurrency = event.detail;
      if (newCurrency && SUPPORTED_CURRENCIES.find(c => c.code === newCurrency)) {
        setSelectedCurrency(newCurrency);
      }
    };

    window.addEventListener('currency:change', handleCurrencyChange);

    return () => {
      window.removeEventListener('currency:change', handleCurrencyChange);
    };
  }, []);

  // Convert price from INR to selected currency
  const convertPrice = (priceINR, targetCurrency = selectedCurrency) => {
    if (!priceINR || isNaN(priceINR)) return 0;

    // If target is INR, return as is
    if (targetCurrency === 'INR') {
      return parseFloat(priceINR);
    }

    // Safety check: if exchangeRates is not loaded yet, use default rates
    if (!exchangeRates || Object.keys(exchangeRates).length === 0) {
      // Fallback conversion rates (approximate)
      const fallbackRates = {
        'USD': 0.012,
        'EUR': 0.011,
        'GBP': 0.0095,
        'JPY': 1.8,
        'CNY': 0.086,
        'AUD': 0.018,
        'CAD': 0.016,
        'CHF': 0.010,
        'AED': 0.044,
        'MYR': 0.056,
      };

      const rate = fallbackRates[targetCurrency] || 0.012;
      return priceINR * rate;
    }

    // Get rate for INR to USD
    const inrToUsdRate = exchangeRates['INR'] ? (1 / exchangeRates['INR']) : 0.012;

    // Convert INR to USD first
    const priceUSD = priceINR * inrToUsdRate;

    // If target is USD, return
    if (targetCurrency === 'USD') {
      return priceUSD;
    }

    // Convert USD to target currency
    const usdToTargetRate = exchangeRates[targetCurrency] || 1;
    return priceUSD * usdToTargetRate;
  };

  // Format price with currency symbol
  const formatPrice = (price, currency = selectedCurrency, showSymbol = true) => {
    const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === currency);
    const symbol = currencyInfo?.symbol || currency;

    // Format number with appropriate decimal places
    const decimals = currency === 'JPY' ? 0 : 2;
    const formattedNumber = parseFloat(price).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

    return showSymbol ? `${symbol}${formattedNumber}` : formattedNumber;
  };

  // Convert and format price in one go
  const convertAndFormat = (priceINR, targetCurrency = selectedCurrency) => {
    const converted = convertPrice(priceINR, targetCurrency);
    return formatPrice(converted, targetCurrency);
  };

  const value = {
    selectedCurrency,
    currency: selectedCurrency, // Alias for convenience
    setSelectedCurrency,
    changeCurrency: setSelectedCurrency, // Alias for convenience
    exchangeRates,
    loading,
    error,
    supportedCurrencies: SUPPORTED_CURRENCIES,
    convertPrice,
    formatPrice,
    convertAndFormat,
    refreshRates: fetchExchangeRates,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
