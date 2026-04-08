const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

// Test credentials
const TEST_USER = {
  email: 'user@test.com',
  password: 'test123'
};

async function testMyReviewsEndpoint() {
  console.log('\n🧪 Testing My Reviews Endpoint...\n');

  try {
    // Step 1: Login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/users/login`, TEST_USER);

    if (!loginResponse.data.token) {
      throw new Error('Failed to get authentication token');
    }

    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log(`✅ Logged in successfully as ${loginResponse.data.user.email} (ID: ${userId})`);

    // Step 2: Test GET /api/my-reviews/all
    console.log('\n2️⃣ Fetching all reviews...');
    const reviewsResponse = await axios.get(`${API_BASE_URL}/api/my-reviews/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Successfully fetched reviews!');
    console.log('\n📊 Review Statistics:');
    console.log(JSON.stringify(reviewsResponse.data.data.stats, null, 2));

    console.log('\n📝 Tour Reviews:', reviewsResponse.data.data.tours.length);
    if (reviewsResponse.data.data.tours.length > 0) {
      console.log('   Sample:', reviewsResponse.data.data.tours[0].tour_name);
    }

    console.log('📝 Destination Reviews:', reviewsResponse.data.data.destinations.length);
    if (reviewsResponse.data.data.destinations.length > 0) {
      console.log('   Sample:', reviewsResponse.data.data.destinations[0].destination_name);
    }

    console.log('📝 Addon Reviews:', reviewsResponse.data.data.addons.length);
    if (reviewsResponse.data.data.addons.length > 0) {
      console.log('   Sample:', reviewsResponse.data.data.addons[0].addon_name);
    }

    console.log('📝 Vehicle Reviews:', reviewsResponse.data.data.vehicles.length);

    console.log('\n✅ All tests passed successfully! 🎉');
    console.log('\n📍 You can now visit: http://localhost:3000/my-reviews');

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Run tests
testMyReviewsEndpoint();
