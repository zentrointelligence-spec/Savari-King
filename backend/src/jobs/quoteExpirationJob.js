/**
 * Quote Expiration Cron Job
 * Vérifie et expire automatiquement les devis après 48 heures
 * S'exécute toutes les heures
 */

const cron = require('node-cron');
const { checkAndExpireQuotes } = require('../services/quoteExpirationService');

/**
 * Tâche cron pour vérifier et expirer les devis
 * S'exécute toutes les heures à la minute 0
 * Cron expression: '0 * * * *' = à chaque heure pile (00:00, 01:00, 02:00, etc.)
 */
const quoteExpirationTask = cron.schedule(
  '0 * * * *', // Toutes les heures
  async () => {
    console.log('\n🔍 [Cron Job] Checking for expired quotes...');
    console.log(`⏰ Time: ${new Date().toLocaleString()}`);

    try {
      const expiredCount = await checkAndExpireQuotes();

      if (expiredCount > 0) {
        console.log(`✅ [Cron Job] Successfully expired ${expiredCount} quote(s)`);
      } else {
        console.log(`✅ [Cron Job] No quotes to expire at this time`);
      }
    } catch (error) {
      console.error('❌ [Cron Job] Error in quote expiration job:', error);
    }

    console.log(`⏰ Next run scheduled at: ${new Date(Date.now() + 60 * 60 * 1000).toLocaleString()}\n`);
  },
  {
    scheduled: false, // Ne démarre pas automatiquement
    timezone: 'Asia/Kolkata' // Timezone pour l'Inde (Kerala)
  }
);

/**
 * Démarrer le cron job
 */
const startQuoteExpirationJob = () => {
  console.log('\n📅 Starting Quote Expiration Cron Job...');
  console.log('⏰ Schedule: Every hour at minute 0');
  console.log('🌍 Timezone: Asia/Kolkata (Indian Standard Time)');

  quoteExpirationTask.start();

  console.log('✅ Quote Expiration Cron Job started successfully');
  console.log(`⏰ First run will be at: ${getNextHourTimestamp()}\n`);
};

/**
 * Arrêter le cron job
 */
const stopQuoteExpirationJob = () => {
  console.log('\n⏸️  Stopping Quote Expiration Cron Job...');
  quoteExpirationTask.stop();
  console.log('✅ Quote Expiration Cron Job stopped\n');
};

/**
 * Exécuter manuellement le job (pour tests)
 */
const runQuoteExpirationJobNow = async () => {
  console.log('\n🔄 [Manual Run] Running Quote Expiration Job now...');
  console.log(`⏰ Time: ${new Date().toLocaleString()}`);

  try {
    const expiredCount = await checkAndExpireQuotes();

    if (expiredCount > 0) {
      console.log(`✅ [Manual Run] Successfully expired ${expiredCount} quote(s)`);
    } else {
      console.log(`✅ [Manual Run] No quotes to expire at this time`);
    }

    return expiredCount;
  } catch (error) {
    console.error('❌ [Manual Run] Error in quote expiration job:', error);
    throw error;
  }
};

/**
 * Obtenir le timestamp de la prochaine heure pile
 */
const getNextHourTimestamp = () => {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1);
  nextHour.setMinutes(0);
  nextHour.setSeconds(0);
  nextHour.setMilliseconds(0);
  return nextHour.toLocaleString();
};

module.exports = {
  startQuoteExpirationJob,
  stopQuoteExpirationJob,
  runQuoteExpirationJobNow,
  quoteExpirationTask
};
