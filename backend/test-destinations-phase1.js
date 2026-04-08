// ======================================================================
// TEST SCRIPT FOR PHASE 1 - DESTINATIONS MODULE
// Tests all new API endpoints and verifies functionality
// ======================================================================

const API_BASE_URL = 'http://localhost:5000/api';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results tracker
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
};

/**
 * Helper function to make API requests
 */
async function apiRequest(endpoint, method = 'GET', body = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();
  return { status: response.status, data };
}

/**
 * Log test result
 */
function logTest(testName, passed, message = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`${colors.green}✓${colors.reset} ${testName}`);
  } else {
    testResults.failed++;
    console.log(`${colors.red}✗${colors.reset} ${testName}`);
    if (message) {
      console.log(`  ${colors.yellow}→${colors.reset} ${message}`);
    }
  }
}

/**
 * Print section header
 */
function printSection(title) {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
}

/**
 * TEST 1: Get Popular Destinations
 */
async function testGetPopularDestinations() {
  printSection('TEST 1: GET /api/destinations/popular');

  try {
    // Test 1.1: Default parameters
    const result1 = await apiRequest('/destinations/popular');
    logTest(
      'Should return popular destinations with default limit',
      result1.status === 200 && Array.isArray(result1.data.data) && result1.data.data.length > 0
    );

    // Test 1.2: Custom limit
    const result2 = await apiRequest('/destinations/popular?limit=3');
    logTest(
      'Should respect custom limit parameter',
      result2.status === 200 && result2.data.data.length <= 3
    );

    // Test 1.3: Different criteria
    const result3 = await apiRequest('/destinations/popular?criteria=rating');
    logTest(
      'Should support different sorting criteria (rating)',
      result3.status === 200 && result3.data.data.length > 0
    );

    // Test 1.4: Verify data structure
    if (result1.data.data && result1.data.data.length > 0) {
      const dest = result1.data.data[0];
      const hasRequiredFields =
        dest.id &&
        dest.name &&
        dest.location &&
        dest.stats &&
        dest.images &&
        typeof dest.stats.popularityScore === 'number';

      logTest('Should return properly formatted destination objects', hasRequiredFields);

      // Log sample destination
      console.log(`\n  ${colors.yellow}Sample Destination:${colors.reset}`);
      console.log(`    ID: ${dest.id}`);
      console.log(`    Name: ${dest.name}`);
      console.log(`    Popularity Score: ${dest.stats.popularityScore}`);
      console.log(`    Tour Count: ${dest.stats.tourCount}`);
      console.log(`    Avg Rating: ${dest.stats.avgRating}`);
    }
  } catch (error) {
    logTest('GET /api/destinations/popular', false, error.message);
  }
}

/**
 * TEST 2: Get All Destinations with Filters
 */
async function testGetAllDestinations() {
  printSection('TEST 2: GET /api/destinations (with filters)');

  try {
    // Test 2.1: Get all destinations
    const result1 = await apiRequest('/destinations');
    logTest(
      'Should return all active destinations',
      result1.status === 200 && Array.isArray(result1.data.data)
    );

    // Test 2.2: Filter by region
    const result2 = await apiRequest('/destinations?regions=South India');
    logTest(
      'Should filter destinations by region',
      result2.status === 200 && result2.data.data.length > 0
    );

    // Test 2.3: Filter by minimum rating
    const result3 = await apiRequest('/destinations?minRating=4.0');
    logTest(
      'Should filter destinations by minimum rating',
      result3.status === 200 &&
        result3.data.data.every((d) => d.stats.avgRating >= 4.0)
    );

    // Test 2.4: Pagination
    const result4 = await apiRequest('/destinations?limit=5&offset=0');
    logTest(
      'Should support pagination',
      result4.status === 200 && result4.data.data.length <= 5
    );

    console.log(`\n  ${colors.yellow}Total Destinations Found:${colors.reset} ${result1.data.count}`);
  } catch (error) {
    logTest('GET /api/destinations', false, error.message);
  }
}

/**
 * TEST 3: Advanced Search
 */
async function testAdvancedSearch() {
  printSection('TEST 3: POST /api/destinations/search');

  try {
    // Test 3.1: Text search
    const result1 = await apiRequest('/destinations/search', 'POST', {
      query: 'kerala',
      limit: 10,
    });
    logTest(
      'Should perform text search',
      result1.status === 200 && result1.data.data.length > 0
    );

    // Test 3.2: Multi-filter search
    const result2 = await apiRequest('/destinations/search', 'POST', {
      budgetCategories: ['moderate'],
      adventureLevels: ['low', 'moderate'],
      minRating: 4.0,
      limit: 10,
    });
    logTest(
      'Should support multiple filters',
      result2.status === 200 && Array.isArray(result2.data.data)
    );

    // Test 3.3: Special flags filter
    const result3 = await apiRequest('/destinations/search', 'POST', {
      flags: ['eco_friendly'],
      limit: 10,
    });
    logTest(
      'Should filter by special flags (eco_friendly)',
      result3.status === 200
    );

    console.log(`\n  ${colors.yellow}Search Results:${colors.reset}`);
    console.log(`    Text search (kerala): ${result1.data.count} results`);
    console.log(`    Multi-filter search: ${result2.data.count} results`);
    console.log(`    Eco-friendly filter: ${result3.data.count} results`);
  } catch (error) {
    logTest('POST /api/destinations/search', false, error.message);
  }
}

/**
 * TEST 4: Get Destination by ID
 */
async function testGetDestinationById() {
  printSection('TEST 4: GET /api/destinations/:id');

  try {
    // First, get a destination ID
    const popularResult = await apiRequest('/destinations/popular?limit=1');

    if (popularResult.data.data && popularResult.data.data.length > 0) {
      const destId = popularResult.data.data[0].id;

      // Test 4.1: Get destination by ID
      const result1 = await apiRequest(`/destinations/${destId}`);
      logTest(
        'Should return destination details by ID',
        result1.status === 200 && result1.data.data.id === destId
      );

      // Test 4.2: Verify detailed data
      const dest = result1.data.data;
      const hasDetailedInfo =
        dest.timing &&
        dest.attractions &&
        dest.logistics &&
        dest.travelInfo;

      logTest('Should include detailed destination information', hasDetailedInfo);

      // Log detailed info
      console.log(`\n  ${colors.yellow}Destination Details:${colors.reset}`);
      console.log(`    Name: ${dest.name}`);
      console.log(`    Region: ${dest.location.region}`);
      console.log(`    Best Time to Visit: ${dest.timing.bestTimeToVisit || 'N/A'}`);
      console.log(`    Top Attractions: ${dest.attractions.top?.length || 0}`);
      console.log(`    Activities: ${dest.attractions.activities?.length || 0}`);
    } else {
      logTest('GET /api/destinations/:id', false, 'No destinations available for testing');
    }

    // Test 4.3: Non-existent destination
    const result2 = await apiRequest('/destinations/99999');
    logTest(
      'Should return 404 for non-existent destination',
      result2.status === 404
    );
  } catch (error) {
    logTest('GET /api/destinations/:id', false, error.message);
  }
}

/**
 * TEST 5: Get Related Destinations
 */
async function testGetRelatedDestinations() {
  printSection('TEST 5: GET /api/destinations/:id/related');

  try {
    // Get a destination ID
    const popularResult = await apiRequest('/destinations/popular?limit=1');

    if (popularResult.data.data && popularResult.data.data.length > 0) {
      const destId = popularResult.data.data[0].id;

      // Test 5.1: Get related destinations
      const result1 = await apiRequest(`/destinations/${destId}/related?limit=4`);
      logTest(
        'Should return related destinations',
        result1.status === 200 && Array.isArray(result1.data.data)
      );

      // Test 5.2: Verify different from source
      const relatedDests = result1.data.data;
      const allDifferent = relatedDests.every((d) => d.id !== destId);
      logTest('Related destinations should be different from source', allDifferent);

      console.log(`\n  ${colors.yellow}Related Destinations Found:${colors.reset} ${relatedDests.length}`);
      if (relatedDests.length > 0) {
        relatedDests.slice(0, 3).forEach((dest) => {
          console.log(`    - ${dest.name} (Score: ${dest.stats.popularityScore})`);
        });
      }
    }
  } catch (error) {
    logTest('GET /api/destinations/:id/related', false, error.message);
  }
}

/**
 * TEST 6: Get Nearby Destinations
 */
async function testGetNearbyDestinations() {
  printSection('TEST 6: GET /api/destinations/:id/nearby');

  try {
    // Get a destination with coordinates
    const allDests = await apiRequest('/destinations?limit=50');
    const destWithCoords = allDests.data.data.find(
      (d) => d.location.latitude && d.location.longitude
    );

    if (destWithCoords) {
      const destId = destWithCoords.id;

      // Test 6.1: Get nearby destinations
      const result1 = await apiRequest(`/destinations/${destId}/nearby?limit=4&radius=500`);
      logTest(
        'Should return nearby destinations',
        result1.status === 200 && Array.isArray(result1.data.data)
      );

      // Test 6.2: Verify distance is included
      const nearbyDests = result1.data.data;
      const allHaveDistance = nearbyDests.every((d) => d.distance_km !== undefined);
      logTest('Nearby destinations should include distance', allHaveDistance);

      console.log(`\n  ${colors.yellow}Nearby Destinations:${colors.reset}`);
      console.log(`    Source: ${destWithCoords.name}`);
      console.log(`    Found: ${nearbyDests.length} destinations`);
      if (nearbyDests.length > 0) {
        nearbyDests.slice(0, 3).forEach((dest) => {
          console.log(`    - ${dest.name} (${dest.distance_km} km away)`);
        });
      }
    } else {
      logTest('GET /api/destinations/:id/nearby', false, 'No destinations with coordinates found');
    }
  } catch (error) {
    logTest('GET /api/destinations/:id/nearby', false, error.message);
  }
}

/**
 * TEST 7: Get Destination Stats
 */
async function testGetDestinationStats() {
  printSection('TEST 7: GET /api/destinations/:id/stats');

  try {
    // Get a destination ID
    const popularResult = await apiRequest('/destinations/popular?limit=1');

    if (popularResult.data.data && popularResult.data.data.length > 0) {
      const destId = popularResult.data.data[0].id;

      // Test 7.1: Get destination stats
      const result1 = await apiRequest(`/destinations/${destId}/stats`);
      logTest(
        'Should return destination statistics',
        result1.status === 200 && result1.data.data
      );

      // Test 7.2: Verify stats structure
      const stats = result1.data.data;
      const hasRequiredStats =
        typeof stats.tourCount === 'number' &&
        typeof stats.totalBookings === 'number' &&
        typeof stats.avgRating === 'number' &&
        stats.priceRange !== undefined;

      logTest('Stats should include all required fields', hasRequiredStats);

      console.log(`\n  ${colors.yellow}Destination Statistics:${colors.reset}`);
      console.log(`    Tour Count: ${stats.tourCount}`);
      console.log(`    Total Bookings: ${stats.totalBookings}`);
      console.log(`    Average Rating: ${stats.avgRating}`);
      console.log(`    Review Count: ${stats.reviewCount}`);
      console.log(`    Total Likes: ${stats.totalLikes}`);
      console.log(`    Active Tours: ${stats.activeTours}`);
    }
  } catch (error) {
    logTest('GET /api/destinations/:id/stats', false, error.message);
  }
}

/**
 * TEST 8: Featured and Trending Destinations
 */
async function testFeaturedAndTrending() {
  printSection('TEST 8: Featured & Trending Destinations');

  try {
    // Test 8.1: Get featured destinations
    const result1 = await apiRequest('/destinations/featured?limit=6');
    logTest(
      'Should return featured destinations',
      result1.status === 200 && Array.isArray(result1.data.data)
    );

    // Test 8.2: Get trending destinations
    const result2 = await apiRequest('/destinations/trending?limit=6');
    logTest(
      'Should return trending destinations',
      result2.status === 200 && Array.isArray(result2.data.data)
    );

    console.log(`\n  ${colors.yellow}Special Destinations:${colors.reset}`);
    console.log(`    Featured: ${result1.data.count} destinations`);
    console.log(`    Trending: ${result2.data.count} destinations`);
  } catch (error) {
    logTest('Featured & Trending endpoints', false, error.message);
  }
}

/**
 * Print final summary
 */
function printSummary() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}TEST SUMMARY${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  const passRate = ((testResults.passed / testResults.total) * 100).toFixed(1);

  console.log(`  Total Tests: ${testResults.total}`);
  console.log(`  ${colors.green}Passed: ${testResults.passed}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${testResults.failed}${colors.reset}`);
  console.log(`  Pass Rate: ${passRate}%\n`);

  if (testResults.failed === 0) {
    console.log(`  ${colors.green}✓ All tests passed! Phase 1 is ready.${colors.reset}\n`);
  } else {
    console.log(`  ${colors.yellow}⚠ Some tests failed. Please review the errors above.${colors.reset}\n`);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`${colors.cyan}
╔═══════════════════════════════════════════════════════════╗
║   DESTINATIONS MODULE - PHASE 1 API TESTS                 ║
║   Testing all new endpoints and functionality             ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);

  try {
    await testGetPopularDestinations();
    await testGetAllDestinations();
    await testAdvancedSearch();
    await testGetDestinationById();
    await testGetRelatedDestinations();
    await testGetNearbyDestinations();
    await testGetDestinationStats();
    await testFeaturedAndTrending();

    printSummary();
  } catch (error) {
    console.error(`\n${colors.red}Fatal error during test execution:${colors.reset}`, error);
    process.exit(1);
  }
}

// Run the tests
runTests();
