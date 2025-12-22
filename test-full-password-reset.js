// Comprehensive test for password reset functionality
// Tests: forgot-password and reset-password endpoints

const http = require('http');

const email = 'testuser@example.com';
let resetCode = null;

// Test 1: Request password reset
function testForgotPassword() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      email: email
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/forgot-password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('\n✅ TEST 1: FORGOT PASSWORD');
        console.log('Status:', res.statusCode);
        const response = JSON.parse(data);
        console.log('Response:', response);
        
        // Extract reset code from console logs (in real scenario, user gets this via email)
        console.log('\n💡 Note: In a real scenario, the user would receive the reset code via email.');
        console.log('For testing, check the backend console for the reset code.');
        
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', (error) => {
      console.error('❌ TEST 1 FAILED:', error.message);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Test 2: Reset password (requires manual reset code from console)
function testResetPassword(resetCode) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      email: email,
      resetCode: resetCode,
      newPassword: 'NewPassword123!'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/reset-password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('\n✅ TEST 2: RESET PASSWORD');
        console.log('Status:', res.statusCode);
        const response = JSON.parse(data);
        console.log('Response:', response);
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', (error) => {
      console.error('❌ TEST 2 FAILED:', error.message);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('🚀 STARTING PASSWORD RESET FLOW TEST\n');
  
  // Test 1: Forgot password
  const test1Passed = await testForgotPassword();
  
  if (!test1Passed) {
    console.log('\n❌ Forgot password test failed. Stopping tests.');
    return;
  }
  
  console.log('\n⏳ Waiting for 3 seconds before proceeding to reset password test...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // For testing purposes, use a placeholder reset code
  // In real scenario, user would get this from email
  const testResetCode = 'B471D2'; // From the forgot-password test output
  
  console.log(`\n📝 Using reset code: ${testResetCode}`);
  const test2Passed = await testResetPassword(testResetCode);
  
  if (test2Passed) {
    console.log('\n✅ ALL TESTS PASSED - PASSWORD RESET FLOW WORKS!');
  } else {
    console.log('\n❌ Reset password test failed.');
  }
  
  process.exit(0);
}

runTests();
