const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

// Test credentials - use existing admin user
const TEST_USER = {
  email: 'admin@test.com',
  password: 'admin123'
};

async function testEmailNotifications() {
  console.log('🧪 Testing Email Notifications System\n');

  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/users/login`, TEST_USER);

    if (!loginResponse.data || !loginResponse.data.token) {
      console.error('❌ Login failed:', loginResponse.data ? loginResponse.data.error : 'Unknown error');
      console.error('   Full response:', JSON.stringify(loginResponse.data, null, 2));
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    const userName = loginResponse.data.user.name || loginResponse.data.user.full_name || 'Unknown';
    console.log(`   User: ${userName} (${loginResponse.data.user.email})\n`);

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Get current preferences
    console.log('2️⃣ Getting current preferences...');
    const getResponse = await axios.get(`${API_BASE_URL}/api/users/preferences`, { headers });

    console.log('✅ Current preferences retrieved:');
    console.log('   Language:', getResponse.data.preferences.language || 'not set');
    console.log('   Currency:', getResponse.data.preferences.currency || 'not set');
    console.log('   Email Notifications:', getResponse.data.preferences.emailNotifications ?
      JSON.stringify(getResponse.data.preferences.emailNotifications) : 'not set');
    console.log('   Push Notifications:', getResponse.data.preferences.pushNotifications ?
      JSON.stringify(getResponse.data.preferences.pushNotifications) : 'not set\n');

    // Step 3: Update email notification preferences
    console.log('3️⃣ Updating email notification preferences...');
    const newEmailNotifications = {
      bookingConfirmation: true,
      quoteReceived: true,
      paymentConfirmed: true,
      tripReminders: false,
      promotionalOffers: true
    };

    const updateResponse = await axios.put(
      `${API_BASE_URL}/api/users/preferences`,
      { emailNotifications: newEmailNotifications },
      { headers }
    );

    if (!updateResponse.data.success) {
      console.error('❌ Update failed:', updateResponse.data.error);
      return;
    }

    console.log('✅ Email notifications updated successfully\n');

    // Step 4: Verify the update
    console.log('4️⃣ Verifying update...');
    const verifyResponse = await axios.get(`${API_BASE_URL}/api/users/preferences`, { headers });

    console.log('✅ Verification successful:');
    console.log('   Email Notifications:', JSON.stringify(verifyResponse.data.preferences.emailNotifications, null, 2));

    // Compare
    const savedPrefs = verifyResponse.data.preferences.emailNotifications;
    let allMatch = true;

    console.log('\n📊 Comparison:');
    for (const [key, value] of Object.entries(newEmailNotifications)) {
      const match = savedPrefs[key] === value;
      console.log(`   ${key}: ${value} → ${savedPrefs[key]} ${match ? '✅' : '❌'}`);
      if (!match) allMatch = false;
    }

    if (allMatch) {
      console.log('\n✅ All email notification preferences saved correctly!');
    } else {
      console.log('\n❌ Some preferences do not match!');
    }

    // Step 5: Test push notifications
    console.log('\n5️⃣ Testing push notifications...');
    const newPushNotifications = {
      enabled: true,
      bookingUpdates: true,
      quoteExpiring: false,
      tripReminders: true
    };

    await axios.put(
      `${API_BASE_URL}/api/users/preferences`,
      { pushNotifications: newPushNotifications },
      { headers }
    );

    const verifyPush = await axios.get(`${API_BASE_URL}/api/users/preferences`, { headers });
    console.log('✅ Push notifications:', JSON.stringify(verifyPush.data.preferences.pushNotifications, null, 2));

    console.log('\n🎉 Email Notifications System Test Complete!');

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
  }
}

// Run the test
testEmailNotifications();
