// Quick test to verify all routes can be imported without errors
const path = require('path');

console.log('Testing route imports...\n');

const routes = [
  { name: 'auth', path: './backend/src/routes/auth' },
  { name: 'calendar', path: './backend/src/routes/calendar' },
  { name: 'commitments', path: './backend/src/routes/commitments' },
  { name: 'crm', path: './backend/src/routes/crm' },
  { name: 'email', path: './backend/src/routes/email' },
  { name: 'health', path: './backend/src/routes/health' }
];

routes.forEach(route => {
  try {
    const imported = require(route.path);
    console.log(`✅ ${route.name}: OK`);
  } catch (error) {
    console.error(`❌ ${route.name}: FAILED`);
    console.error(`   Error: ${error.message}\n`);
  }
});

console.log('\nAll critical routes tested.');
