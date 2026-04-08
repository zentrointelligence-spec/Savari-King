/**
 * Test Script for PDF Generation with All Fixes
 * Tests: Logo, Vehicle Duration, Addon Per-Person, Discounts Display
 */

require('dotenv').config();
const { generateDetailedQuotePDF, generateGeneralQuotePDF } = require('./src/services/pdfGenerationService');
const db = require('./src/db');

async function testPdfGeneration() {
  try {
    console.log('🔍 Finding a booking with quote revision...');

    // Find a booking with quote that has discounts
    const result = await db.query(`
      SELECT
        bqr.id as revision_id,
        b.booking_reference,
        bqr.revision_number,
        bqr.discounts,
        bqr.total_discounts,
        bqr.subtotal_price,
        bqr.final_price
      FROM booking_quote_revisions bqr
      JOIN bookings b ON bqr.booking_id = b.id
      WHERE bqr.discounts IS NOT NULL
        AND bqr.discounts::text != '[]'
      ORDER BY bqr.created_at DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      console.log('❌ No booking with discounts found');
      process.exit(1);
    }

    const revision = result.rows[0];
    console.log('\n📋 Testing with:');
    console.log(`   Booking: ${revision.booking_reference}`);
    console.log(`   Revision: v${revision.revision_number}`);
    console.log(`   Subtotal: ₹${parseFloat(revision.subtotal_price).toLocaleString('en-IN')}`);
    console.log(`   Discounts: ₹${parseFloat(revision.total_discounts).toLocaleString('en-IN')}`);
    console.log(`   Final: ₹${parseFloat(revision.final_price).toLocaleString('en-IN')}`);

    // Parse discounts (might be string or object)
    let discountDetails;
    try {
      discountDetails = typeof revision.discounts === 'string'
        ? JSON.parse(revision.discounts)
        : revision.discounts;
    } catch (e) {
      discountDetails = revision.discounts;
    }
    console.log(`   Discount Details: ${JSON.stringify(discountDetails, null, 2)}`);

    console.log('\n🔄 Generating detailed PDF...');
    const detailedPath = await generateDetailedQuotePDF(revision.revision_id);
    console.log(`✅ Detailed PDF generated: ${detailedPath}`);

    console.log('\n🔄 Generating general PDF...');
    const generalPath = await generateGeneralQuotePDF(revision.revision_id);
    console.log(`✅ General PDF generated: ${generalPath}`);

    console.log('\n✨ All tests completed successfully!');
    console.log('\n📁 Check these files:');
    console.log(`   - backend/public${detailedPath}`);
    console.log(`   - backend/public${generalPath}`);
    console.log('\n🔍 Verify:');
    console.log('   ✓ Logo displays correctly');
    console.log('   ✓ Vehicle subtotals show: price/day × duration × quantity');
    console.log('   ✓ Add-ons show per-person or per-unit correctly');
    console.log('   ✓ Discounts section is visible with all discounts');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testPdfGeneration();
