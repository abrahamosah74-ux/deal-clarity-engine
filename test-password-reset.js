// Test file for password reset functionality
// Run with: node test-password-reset.js

const http = require('http');

// Test forgot-password endpoint
function testForgotPassword() {
  const postData = JSON.stringify({
    email: 'rosemama454@gmail.com'
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
      console.log('\n✅ FORGOT PASSWORD TEST');
      console.log('Status:', res.statusCode);
      console.log('Response:', JSON.parse(data));
      console.log('\n💡 Check the backend console for the reset code!\n');
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error:', error.message);
    console.error('Make sure backend is running on port 5000');
  });

  req.write(postData);
  req.end();
}

// Run test
testForgotPassword();
