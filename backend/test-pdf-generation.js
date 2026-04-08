/**
 * Script de test pour la génération de PDFs
 * Teste les templates détaillé et général
 */

require('dotenv').config();
const { generateBothQuotePDFs } = require('./src/services/pdfGenerationService');
const db = require('./src/db');

console.log('========================================');
console.log('  TEST PDF GENERATION SERVICE');
console.log('========================================\n');

async function testPDFGeneration() {
  try {
    // Trouver une révision existante pour tester
    console.log('🔍 Looking for an existing revision to test...');

    const result = await db.query(
      `SELECT id, booking_id, revision_number
       FROM booking_quote_revisions
       ORDER BY created_at DESC
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      console.log('⚠️  No revisions found in database. Please create a booking first.');
      console.log('   Steps to create a booking:');
      console.log('   1. Start the server: cd backend && npm start');
      console.log('   2. Create a booking via the frontend');
      console.log('   3. Start quote review for that booking');
      console.log('   4. Then run this test again\n');
      process.exit(0);
    }

    const revision = result.rows[0];
    console.log(`✅ Found revision #${revision.id} (Booking #${revision.booking_id}, v${revision.revision_number})\n`);

    console.log('📄 Generating PDFs...');
    console.log('   This may take a few seconds as Puppeteer launches...\n');

    const { detailedPdf, generalPdf } = await generateBothQuotePDFs(revision.id);

    console.log('✅ PDF Generation Successful!\n');
    console.log('📁 Generated files:');
    console.log(`   Detailed PDF: ${detailedPdf}`);
    console.log(`   General PDF:  ${generalPdf}\n`);

    console.log('🔗 Access URLs (when server is running):');
    console.log(`   http://localhost:5000${detailedPdf}`);
    console.log(`   http://localhost:5000${generalPdf}\n`);

    console.log('========================================');
    console.log('  ✅ TEST PASSED');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.log('\n========================================');
    console.log('  ❌ TEST FAILED');
    console.log('========================================\n');
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run the test
testPDFGeneration();
