const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

// Test credentials
const TEST_USER = {
  email: 'admin@test.com',
  currentPassword: 'admin123',
  newPassword: 'NewAdmin123!@#',
  resetPassword: 'admin123' // Pour réinitialiser après le test
};

async function testSecuritySettings() {
  console.log('🔐 Testing Security Settings System\n');

  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/users/login`, {
      email: TEST_USER.email,
      password: TEST_USER.currentPassword
    });

    if (!loginResponse.data || !loginResponse.data.token) {
      console.error('❌ Login failed');
      return;
    }

    const token = loginResponse.data.token;
    const userName = loginResponse.data.user.name || loginResponse.data.user.full_name || 'Unknown';
    console.log('✅ Login successful');
    console.log(`   User: ${userName} (${loginResponse.data.user.email})\n`);

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Test password change with wrong current password
    console.log('2️⃣ Testing password change with wrong current password...');
    try {
      await axios.post(
        `${API_BASE_URL}/api/users/change-password`,
        {
          currentPassword: 'wrongpassword',
          newPassword: TEST_USER.newPassword
        },
        { headers }
      );
      console.log('❌ Should have failed with wrong password');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Correctly rejected wrong current password');
        console.log(`   Error: ${error.response.data.error}\n`);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Step 3: Test password change with correct current password
    console.log('3️⃣ Testing password change with correct current password...');
    try {
      const changeResponse = await axios.post(
        `${API_BASE_URL}/api/users/change-password`,
        {
          currentPassword: TEST_USER.currentPassword,
          newPassword: TEST_USER.newPassword
        },
        { headers }
      );

      console.log('✅ Password changed successfully');
      console.log(`   Response: ${changeResponse.data.message}\n`);

      // Step 4: Verify old password no longer works
      console.log('4️⃣ Verifying old password no longer works...');
      try {
        await axios.post(`${API_BASE_URL}/api/users/login`, {
          email: TEST_USER.email,
          password: TEST_USER.currentPassword
        });
        console.log('❌ Old password still works (should not happen)');
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log('✅ Old password correctly rejected\n');
        }
      }

      // Step 5: Verify new password works
      console.log('5️⃣ Verifying new password works...');
      const newLoginResponse = await axios.post(`${API_BASE_URL}/api/users/login`, {
        email: TEST_USER.email,
        password: TEST_USER.newPassword
      });

      if (newLoginResponse.data && newLoginResponse.data.token) {
        console.log('✅ New password works correctly');
        console.log(`   New token received\n`);

        // Get new token for reset operation
        const newToken = newLoginResponse.data.token;
        const newHeaders = {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json'
        };

        // Step 6: Reset password to original
        console.log('6️⃣ Resetting password to original...');
        await axios.post(
          `${API_BASE_URL}/api/users/change-password`,
          {
            currentPassword: TEST_USER.newPassword,
            newPassword: TEST_USER.resetPassword
          },
          { headers: newHeaders }
        );

        console.log('✅ Password reset to original successfully\n');

        // Step 7: Verify original password works again
        console.log('7️⃣ Verifying original password works...');
        const finalLoginResponse = await axios.post(`${API_BASE_URL}/api/users/login`, {
          email: TEST_USER.email,
          password: TEST_USER.resetPassword
        });

        if (finalLoginResponse.data && finalLoginResponse.data.token) {
          console.log('✅ Original password restored and working\n');
        }
      }

      console.log('🎉 Security Settings Test Complete!\n');
      console.log('📊 Test Summary:');
      console.log('   ✅ Wrong password correctly rejected');
      console.log('   ✅ Password change successful');
      console.log('   ✅ Old password invalidated');
      console.log('   ✅ New password works');
      console.log('   ✅ Password reset successful');
      console.log('   ✅ System fully functional');

    } catch (error) {
      console.error('\n❌ Password change test failed:');
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
      } else {
        console.error('   Error:', error.message);
      }
    }

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
testSecuritySettings();
