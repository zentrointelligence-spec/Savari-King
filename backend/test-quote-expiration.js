/**
 * Script de test pour le service d'expiration des devis
 * Teste manuellement la fonction sans attendre le cron job
 */

require('dotenv').config();
const { runQuoteExpirationJobNow } = require('./src/jobs/quoteExpirationJob');
const { checkAndExpireQuotes } = require('./src/services/quoteExpirationService');

console.log('========================================');
console.log('  TEST QUOTE EXPIRATION SERVICE');
console.log('========================================\n');

console.log('🔍 Testing quote expiration functionality...\n');

// Test direct du service
async function testDirectService() {
  console.log('--- Test 1: Direct Service Call ---');
  try {
    const count = await checkAndExpireQuotes();
    console.log(`\n✅ Test 1 PASSED: Found and expired ${count} quote(s)\n`);
    return count;
  } catch (error) {
    console.error('❌ Test 1 FAILED:', error.message);
    throw error;
  }
}

// Test via le job
async function testViaJob() {
  console.log('--- Test 2: Via Cron Job Function ---');
  try {
    const count = await runQuoteExpirationJobNow();
    console.log(`\n✅ Test 2 PASSED: Job executed and expired ${count} quote(s)\n`);
    return count;
  } catch (error) {
    console.error('❌ Test 2 FAILED:', error.message);
    throw error;
  }
}

// Exécuter les tests
(async () => {
  try {
    await testDirectService();
    await testViaJob();

    console.log('========================================');
    console.log('  ✅ ALL TESTS PASSED');
    console.log('========================================\n');

    console.log('📝 Note: If no quotes were expired, it means:');
    console.log('   - No quotes have been sent yet, OR');
    console.log('   - All sent quotes are still within 48 hours, OR');
    console.log('   - All expired quotes have already been processed\n');

    process.exit(0);
  } catch (error) {
    console.log('\n========================================');
    console.log('  ❌ TESTS FAILED');
    console.log('========================================\n');
    console.error('Error:', error);
    process.exit(1);
  }
})();
