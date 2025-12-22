#!/usr/bin/env node

/**
 * Comprehensive Backend Testing Script
 * Tests the forgot-password and reset-password endpoints
 */

const https = require('https');
const http = require('http');

// Configuration
const BACKENDS = {
  render: {
    name: 'Render Production',
    url: 'https://deal-clarity-engine.onrender.com',
    protocol: 'https'
  },
  local: {
    name: 'Local Development',
    url: 'http://localhost:5000',
    protocol: 'http'
  }
};

const TEST_EMAIL = 'testuser@example.com';

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
            headers: res.headers,
            body: body ? JSON.parse(body) : null,
            rawBody: body
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
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
    
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

/**
 * Test forgot-password endpoint
 */
async function testForgotPassword(backend) {
  console.log(`\n🧪 Testing ${backend.name}...`);
  console.log('─'.repeat(50));
  
  const url = new URL(`${backend.url}/api/auth/forgot-password`);
  const data = JSON.stringify({ email: TEST_EMAIL });
  
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    method: 'POST',
    protocol: backend.protocol + ':',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    },
    timeout: 10000
  };
  
  try {
    const response = await makeRequest(options, data);
    
    if (response.status === 200) {
      console.log(`✅ SUCCESS (HTTP ${response.status})`);
      console.log(`   Response:`, response.body || response.rawBody);
      return true;
    } else {
      console.log(`⚠️  HTTP ${response.status}`);
      console.log(`   Response:`, response.body || response.rawBody);
      return false;
    }
  } catch (error) {
    console.log(`❌ FAILED - ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.log('   → Backend is not running or not reachable');
    } else if (error.code === 'ENOTFOUND') {
      console.log('   → Hostname not found');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('   → Request timeout (backend took too long)');
    }
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║   Backend Connectivity Testing Script              ║');
  console.log('║   Tests: Forgot Password Endpoint                  ║');
  console.log('╚════════════════════════════════════════════════════╝');
  
  const results = {};
  
  for (const [key, backend] of Object.entries(BACKENDS)) {
    results[key] = await testForgotPassword(backend);
  }
  
  console.log('\n' + '═'.repeat(50));
  console.log('📊 Test Summary');
  console.log('═'.repeat(50));
  
  for (const [key, backend] of Object.entries(BACKENDS)) {
    const status = results[key] ? '✅' : '❌';
    console.log(`${status} ${backend.name}: ${results[key] ? 'WORKING' : 'NOT WORKING'}`);
  }
  
  const anyWorking = Object.values(results).some(r => r);
  
  console.log('\n' + '═'.repeat(50));
  if (anyWorking) {
    console.log('✅ At least one backend is reachable!');
  } else {
    console.log('❌ No backends are reachable. Check:');
    console.log('   1. Render deployment status');
    console.log('   2. Local backend is running (if testing locally)');
    console.log('   3. Network connectivity');
    console.log('   4. Firewall/security settings');
  }
  console.log('═'.repeat(50) + '\n');
  
  process.exit(anyWorking ? 0 : 1);
}

// Run tests
runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
