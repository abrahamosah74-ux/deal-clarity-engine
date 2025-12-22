const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/auth/forgot-password',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const data = JSON.stringify({
  email: 'testuser@example.com'
});

const req = http.request(options, (res) => {
  let responseData = '';
  
  console.log(`\n✓ REQUEST SUCCEEDED`);
  console.log(`HTTP Status: ${res.statusCode}`);
  console.log(`\nResponse Headers:`, res.headers);
  console.log(`\nResponse Body:`);
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(responseData);
      console.log(JSON.stringify(parsed, null, 2));
    } catch {
      console.log(responseData);
    }
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.log(`\n✗ REQUEST FAILED`);
  console.log(`Error: ${error.message}`);
  process.exit(1);
});

req.write(data);
req.end();

setTimeout(() => {
  console.log('\n✗ REQUEST TIMEOUT - No response within 5 seconds');
  process.exit(1);
}, 5000);
