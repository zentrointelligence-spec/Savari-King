// ============================================================================
// Currency Update Cron Job
// Automatically updates exchange rates every 30 minutes
// ============================================================================

const cron = require('node-cron');
const currencyService = require('../services/currencyService');

/**
 * Start the currency update cron job
 * Runs every 30 minutes to stay within API limits (1425 requests/month)
 * Calculation: 1500 free requests * 95% = 1425 / 30 days = 47.5/day ≈ 2/hour = every 30 min
 */
function startCurrencyUpdateJob() {
  // Schedule: Every 30 minutes
  // Format: minute hour day month weekday
  const schedule = '*/30 * * * *'; // Every 30 minutes

  console.log('💱 Starting currency update cron job (every 30 minutes)...');

  const job = cron.schedule(
    schedule,
    async () => {
      console.log('⏰ Running scheduled currency update...');

      try {
        const result = await currencyService.updateExchangeRates();

        if (result.success) {
          console.log(`✅ Currency update successful: ${result.updatedCount} rates updated`);
        } else {
          console.error(`❌ Currency update failed: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('❌ Error in currency update job:', error.message);
      }
    },
    {
      scheduled: true,
      timezone: 'UTC', // Use UTC timezone for consistency
    }
  );

  // Run immediately on startup to ensure we have fresh rates
  console.log('🚀 Running initial currency update...');
  currencyService
    .updateExchangeRates()
    .then((result) => {
      if (result.success) {
        console.log(`✅ Initial currency update successful: ${result.updatedCount} rates updated`);
      } else {
        console.warn(`⚠️  Initial currency update failed, will retry in 30 minutes`);
      }
    })
    .catch((error) => {
      console.error('❌ Error in initial currency update:', error.message);
    });

  return job;
}

/**
 * Alternative schedule options (commented out):
 *
 * Every hour:
 * const schedule = '0 * * * *';
 *
 * Every 15 minutes:
 * const schedule = '*\/15 * * * *';
 *
 * Once a day at midnight:
 * const schedule = '0 0 * * *';
 *
 * Every 6 hours:
 * const schedule = '0 *\/6 * * *';
 */

module.exports = {
  startCurrencyUpdateJob,
};
