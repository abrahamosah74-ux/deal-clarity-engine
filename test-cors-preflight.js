#!/usr/bin/env node

/**
 * CORS Preflight Testing Script
 * Tests OPTIONS preflight request and actual POST request
 * Helps identify where browser might be blocking the request
 */

const https = require('https');
const http = require('http');

const TEST_CONFIG = {
  name: 'Render Production',
  url: 'https://deal-clarity-engine.onrender.com/api/auth/forgot-password',
  protocol: 'https',
  // Simulate request from browser at app.deal-clarity.com
  origin: 'https://app.deal-clarity.com',
  email: 'testuser@example.com'
};

/**
 * Make HTTP/HTTPS request
 */
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const isHttps = options.protocol === 'https:';
    const protocol = isHttps ? https : http;
    
    const req = protocol.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            body: body ? JSON.parse(body) : null,
            rawBody: body
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            body: null,
            rawBody: body
          });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(10000);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

/**
 * Test OPTIONS preflight request
 */
async function testPreflight() {
  console.log('\n🔍 Testing OPTIONS Preflight Request');
  console.log('─'.repeat(60));
  
  const url = new URL(TEST_CONFIG.url);
  
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: 'OPTIONS',
    protocol: TEST_CONFIG.protocol + ':',
    headers: {
      'Origin': TEST_CONFIG.origin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
    timeout: 10000
  };
  
  console.log('Request:');
  console.log(`  Method: ${options.method}`);
  console.log(`  URL: ${TEST_CONFIG.url}`);
  console.log(`  Origin: ${TEST_CONFIG.origin}`);
  console.log(`  Access-Control-Request-Method: POST`);
  console.log(`  Access-Control-Request-Headers: content-type`);
  
  try {
    const response = await makeRequest(options, null);
    
    console.log('\nResponse:');
    console.log(`  Status: ${response.status} ${response.statusText}`);
    console.log('\n  CORS Headers:');
    console.log(`    access-control-allow-origin: ${response.headers['access-control-allow-origin'] || 'MISSING ❌'}`);
    console.log(`    access-control-allow-methods: ${response.headers['access-control-allow-methods'] || 'MISSING ❌'}`);
    console.log(`    access-control-allow-headers: ${response.headers['access-control-allow-headers'] || 'MISSING ❌'}`);
    console.log(`    access-control-allow-credentials: ${response.headers['access-control-allow-credentials'] || 'MISSING'}`);
    
    if (response.status === 200 && response.headers['access-control-allow-origin']) {
      console.log('\n✅ Preflight passed! Browser should allow actual request.');
      return true;
    } else {
      console.log('\n❌ Preflight failed or missing CORS headers.');
      return false;
    }
  } catch (error) {
    console.log(`\n❌ Preflight request failed: ${error.message}`);
    return false;
  }
}

/**
 * Test actual POST request
 */
async function testPostRequest() {
  console.log('\n\n🔍 Testing Actual POST Request');
  console.log('─'.repeat(60));
  
  const url = new URL(TEST_CONFIG.url);
  const data = JSON.stringify({ email: TEST_CONFIG.email });
  
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: 'POST',
    protocol: TEST_CONFIG.protocol + ':',
    headers: {
      'Origin': TEST_CONFIG.origin,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    timeout: 10000
  };
  
  console.log('Request:');
  console.log(`  Method: ${options.method}`);
  console.log(`  URL: ${TEST_CONFIG.url}`);
  console.log(`  Origin: ${TEST_CONFIG.origin}`);
  console.log(`  Content-Type: application/json`);
  console.log(`  Body: ${data}`);
  
  try {
    const response = await makeRequest(options, data);
    
    console.log('\nResponse:');
    console.log(`  Status: ${response.status} ${response.statusText}`);
    console.log(`  access-control-allow-origin: ${response.headers['access-control-allow-origin'] || 'MISSING ❌'}`);
    
    if (response.status === 200) {
      console.log(`  Body: ${response.rawBody}`);
      console.log('\n✅ POST request succeeded!');
      return true;
    } else {
      console.log(`  Error: ${response.rawBody || response.statusText}`);
      console.log('\n❌ POST request failed.');
      return false;
    }
  } catch (error) {
    console.log(`\n❌ POST request failed: ${error.message}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   CORS Preflight & POST Request Testing                 ║');
  console.log('║   Simulating browser from app.deal-clarity.com          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  
  const preflightPassed = await testPreflight();
  const postPassed = await testPostRequest();
  
  console.log('\n\n' + '═'.repeat(60));
  console.log('📊 Test Summary');
  console.log('═'.repeat(60));
  console.log(`${preflightPassed ? '✅' : '❌'} OPTIONS Preflight: ${preflightPassed ? 'WORKING' : 'FAILED'}`);
  console.log(`${postPassed ? '✅' : '❌'} POST Request: ${postPassed ? 'WORKING' : 'FAILED'}`);
  
  if (preflightPassed && postPassed) {
    console.log('\n✅ Server is CORS-enabled and responding correctly!');
    console.log('   If browser still shows "Network error", the issue is likely:');
    console.log('   1. Frontend is using wrong API URL (check api.js baseURL)');
    console.log('   2. Browser has a Service Worker blocking the request');
    console.log('   3. Browser cache is stale (hard refresh with Ctrl+F5)');
    console.log('   4. Browser extension is blocking CORS requests');
  } else if (preflightPassed && !postPassed) {
    console.log('\n⚠️  Preflight passed but POST failed - likely request body or server error');
  } else {
    console.log('\n❌ Preflight failed - server CORS headers may be misconfigured');
    console.log('   Check backend/src/index.js CORS configuration');
  }
  
  console.log('═'.repeat(60) + '\n');
  
  process.exit((preflightPassed && postPassed) ? 0 : 1);
}

// Run tests
runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
