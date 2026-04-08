// Simulated exchange rates against INR (base currency)
const rates = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
};

const convertCurrency = (amountInr, toCurrency) => {
  const rate = rates[toCurrency.toUpperCase()];
  if (rate === undefined) {
    // If the currency is not supported, return the price in INR by default.
    console.warn(`Currency ${toCurrency} not supported, defaulting to INR.`);
    return { amount: amountInr, currency: "INR" };
  }
  // Round to 2 decimal places for currencies.
  const convertedAmount = (amountInr * rate).toFixed(2);
  return { amount: convertedAmount, currency: toCurrency.toUpperCase() };
};

module.exports = { convertCurrency };
