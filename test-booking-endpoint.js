const axios = require('axios');

async function testBookingEndpoint() {
  try {
    console.log('\n=== TEST: Direct API Call to /api/bookings/100 ===\n');

    // Faire un appel direct au backend
    const response = await axios.get('http://localhost:5000/api/bookings/100', {
      headers: {
        'Authorization': 'Bearer fake-token-for-testing',
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Response Status:', response.status);
    console.log('✅ Response Data:', JSON.stringify(response.data, null, 2));

    if (response.data.success && response.data.data) {
      const booking = response.data.data;
      console.log('\n📦 Booking Data:');
      console.log('  - ID:', booking.id);
      console.log('  - Reference:', booking.booking_reference);
      console.log('  - Vehicles:', JSON.stringify(booking.selected_vehicles, null, 2));
      console.log('  - Addons:', JSON.stringify(booking.selected_addons, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data || error.message);
  }
}

testBookingEndpoint();
