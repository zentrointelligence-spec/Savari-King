const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
const BOOKING_ID = 97;
const REVISION_ID = 3;

// You need to provide a valid admin token here
// You can get this by logging in as admin and copying the token from browser localStorage
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE';

async function testAutoValidate() {
  console.log('=== TESTING AUTO-VALIDATE ENDPOINT ===\n');

  console.log(`Booking ID: ${BOOKING_ID}`);
  console.log(`Revision ID: ${REVISION_ID}`);
  console.log(`Endpoint: POST ${BASE_URL}/bookings/${BOOKING_ID}/review/${REVISION_ID}/auto-validate\n`);

  try {
    const response = await axios.post(
      `${BASE_URL}/bookings/${BOOKING_ID}/review/${REVISION_ID}/auto-validate`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ SUCCESS!');
    console.log('\nResponse Status:', response.status);
    console.log('\nResponse Data:');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log('\n✅ Auto-validation completed successfully!');

      if (response.data.data) {
        console.log('\nValidation Results:');
        console.log('- Validation Score:', response.data.data.revision?.validation_score || 'N/A');
        console.log('- All Sections Validated:', response.data.data.revision?.all_sections_validated || false);

        if (response.data.data.validation) {
          console.log('\nDetailed Validation:');
          console.log(JSON.stringify(response.data.data.validation, null, 2));
        }
      }
    }

  } catch (error) {
    console.log('❌ ERROR!');

    if (error.response) {
      console.log('\nHTTP Status:', error.response.status);
      console.log('\nError Response:');
      console.log(JSON.stringify(error.response.data, null, 2));

      // Check for specific errors
      if (error.response.status === 401) {
        console.log('\n⚠️  Authentication failed. Make sure you have a valid admin token.');
        console.log('To get a token:');
        console.log('1. Login as admin in the frontend');
        console.log('2. Open browser developer tools > Application > Local Storage');
        console.log('3. Find the "token" key and copy its value');
        console.log('4. Replace ADMIN_TOKEN in this script with that value');
      } else if (error.response.status === 403) {
        console.log('\n⚠️  Access denied. Make sure the token belongs to an admin user.');
      } else if (error.response.status === 404) {
        console.log('\n⚠️  Endpoint not found. Check if the route is properly registered.');
      } else if (error.response.status === 400) {
        console.log('\n⚠️  Bad request. Check the validation logic in the controller.');
      }
    } else if (error.request) {
      console.log('\n⚠️  No response received from server.');
      console.log('Make sure the backend server is running on http://localhost:5000');
    } else {
      console.log('\n⚠️  Error setting up the request:', error.message);
    }

    console.log('\nFull Error Object:');
    console.log(error);
  }
}

// Run the test
console.log('Starting auto-validate endpoint test...\n');
console.log('⚠️  NOTE: You need to replace ADMIN_TOKEN with a valid admin token!\n');

if (ADMIN_TOKEN === 'YOUR_ADMIN_TOKEN_HERE') {
  console.log('❌ ERROR: Please set a valid ADMIN_TOKEN in the script before running.');
  console.log('\nTo get a token:');
  console.log('1. Login as admin in the frontend (http://localhost:5173/login)');
  console.log('2. Open browser developer tools (F12)');
  console.log('3. Go to: Application > Local Storage > http://localhost:5173');
  console.log('4. Find the "token" key and copy its value');
  console.log('5. Replace ADMIN_TOKEN in this script with that value\n');
  process.exit(1);
}

testAutoValidate();
