#!/usr/bin/env node

const https = require('https');

const tests = [
  { 
    name: 'POST /auth/register', 
    method: 'POST', 
    path: '/api/auth/register', 
    data: JSON.stringify({name:'Test User',email:'test@example.com',password:'password123'}) 
  },
  { 
    name: 'POST /auth/forgot-password', 
    method: 'POST', 
    path: '/api/auth/forgot-password', 
    data: JSON.stringify({email:'test@example.com'}) 
  },
  { 
    name: 'POST /auth/login (wrong password)', 
    method: 'POST', 
    path: '/api/auth/login', 
    data: JSON.stringify({email:'test@example.com',password:'wrong'}) 
  }
];

console.log('Testing key auth endpoints...\n');

tests.forEach(test => {
  const options = {
    hostname: 'deal-clarity-engine.onrender.com',
    path: test.path,
    method: test.method,
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://app.deal-clarity.com'
    },
    timeout: 10000
  };
  
  if (test.data) {
    options.headers['Content-Length'] = Buffer.byteLength(test.data);
  }
  
  const req = https.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`✅ ${test.name}: HTTP ${res.statusCode}`);
      if (data && res.statusCode !== 200) {
        console.log(`   Error: ${data.substring(0, 150)}`);
      } else if (data) {
        console.log(`   Success: ${data.substring(0, 150)}`);
      }
    });
  });
  
  req.on('error', err => {
    console.log(`❌ ${test.name}: ${err.message}`);
  });
  
  req.on('timeout', () => {
    console.log(`⏱️ ${test.name}: Timeout`);
    req.destroy();
  });
  
  if (test.data) req.write(test.data);
  req.end();
});
