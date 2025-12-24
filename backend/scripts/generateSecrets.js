#!/usr/bin/env node

/**
 * Security Secrets Generator
 * Use this to generate secure secrets for your application
 */

const crypto = require('crypto');

console.log('\n🔐 === DEAL CLARITY ENGINE - SECURITY SECRETS GENERATOR === 🔐\n');

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log('');

// Generate Session Secret  
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('SESSION_SECRET:');
console.log(sessionSecret);
console.log('');

// Generate CSRF Token Secret
const csrfSecret = crypto.randomBytes(32).toString('hex');
console.log('CSRF_SECRET:');
console.log(csrfSecret);
console.log('');

// Generate API Key
const apiKey = crypto.randomBytes(24).toString('hex');
console.log('API_KEY:');
console.log(apiKey);
console.log('');

console.log('\n📋 INSTRUCTIONS:');
console.log('1. Copy each secret above');
console.log('2. Open your .env file');
console.log('3. Replace the corresponding values');
console.log('4. Save and restart your application');
console.log('5. Delete this output from your terminal history\n');

console.log('⚠️  IMPORTANT: Keep these secrets PRIVATE and SECURE!');
console.log('- Never commit them to git');
console.log('- Never share them in messages or emails');
console.log('- Store them securely in your hosting platform\n');
