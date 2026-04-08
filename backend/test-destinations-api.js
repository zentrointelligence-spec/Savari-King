// Quick test script for destinations API
const destinationService = require('./src/services/destinationService');

async function testDestinationService() {
  console.log('\n========================================');
  console.log('TESTING DESTINATION SERVICE');
  console.log('========================================\n');

  try {
    // Test 1: Get top destinations
    console.log('TEST 1: Get Top 5 Destinations by Popularity');
    console.log('-------------------------------------------');
    const topDests = await destinationService.getTopDestinations(5, 'popularity');
    console.log(`✅ Found ${topDests.length} destinations`);
    topDests.forEach((dest, i) => {
      console.log(`${i + 1}. ${dest.name} (Score: ${dest.stats.popularityScore})`);
      console.log(`   - Tours: ${dest.stats.tourCount}, Rating: ${dest.stats.avgRating}`);
      console.log(`   - Location: ${dest.location.country}, ${dest.location.region || 'N/A'}`);
    });

    // Test 2: Get destination by ID
    console.log('\n\nTEST 2: Get Destination by ID (Kerala, ID=127)');
    console.log('------------------------------------------------');
    const kerala = await destinationService.getDestinationById(127);
    if (kerala) {
      console.log(`✅ ${kerala.name}`);
      console.log(`   Description: ${kerala.shortDescription || kerala.description?.substring(0, 100) + '...'}`);
      console.log(`   Top Attractions: ${kerala.attractions.top.join(', ')}`);
      console.log(`   Activities: ${kerala.attractions.activities.join(', ')}`);
      console.log(`   Best Time: ${kerala.timing.bestTimeToVisit || 'Not specified'}`);
      console.log(`   Current Season: ${kerala.timing.currentSeason || 'No specific season'}`);
      console.log(`   Upcoming Festivals: ${kerala.timing.upcomingFestivals.length} festivals`);
    } else {
      console.log('❌ Kerala not found');
    }

    // Test 3: Search with filters
    console.log('\n\nTEST 3: Search Destinations with Filters');
    console.log('------------------------------------------');
    const filtered = await destinationService.getEnrichedDestinations(
      {
        budgetCategories: ['moderate'],
        minRating: 3.0
      },
      { limit: 3 }
    );
    console.log(`✅ Found ${filtered.length} destinations matching filters`);
    filtered.forEach((dest, i) => {
      console.log(`${i + 1}. ${dest.name} - ${dest.pricing.budgetCategory} (${dest.stats.avgRating}⭐)`);
    });

    // Test 4: Get related destinations
    console.log('\n\nTEST 4: Get Related Destinations to Kerala');
    console.log('--------------------------------------------');
    const related = await destinationService.getRelatedDestinations(127, 3);
    console.log(`✅ Found ${related.length} related destinations`);
    related.forEach((dest, i) => {
      console.log(`${i + 1}. ${dest.name} (Budget: ${dest.pricing.budgetCategory}, Adventure: ${dest.recommendations.adventureLevel})`);
    });

    // Test 5: Get nearby destinations
    console.log('\n\nTEST 5: Get Nearby Destinations to Kerala (500km)');
    console.log('---------------------------------------------------');
    const nearby = await destinationService.getNearbyDestinations(127, 500, 3);
    console.log(`✅ Found ${nearby.length} nearby destinations`);
    nearby.forEach((dest, i) => {
      console.log(`${i + 1}. ${dest.name} - ${dest.distance_km || 'N/A'}km away`);
    });

    // Test 6: Get destination stats
    console.log('\n\nTEST 6: Get Destination Statistics');
    console.log('------------------------------------');
    const stats = await destinationService.getDestinationStats(127);
    if (stats) {
      console.log('✅ Kerala Statistics:');
      console.log(`   - Active Tours: ${stats.activeTours}`);
      console.log(`   - Total Bookings: ${stats.totalBookings}`);
      console.log(`   - Average Rating: ${stats.avgRating}`);
      console.log(`   - Total Likes: ${stats.totalLikes}`);
      console.log(`   - Price Range: ${stats.priceRange.min} - ${stats.priceRange.max}`);
    }

    console.log('\n========================================');
    console.log('ALL TESTS COMPLETED SUCCESSFULLY! ✅');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ ERROR during testing:', error);
    console.error(error.stack);
  } finally {
    // Close DB connection
    const db = require('./src/db');
    await db.pool.end();
  }
}

// Run tests
testDestinationService();
