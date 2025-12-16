const path = require('path');

module.exports = {
  // Electron config
  electronVersion: 'latest',
  
  // Build output
  buildPath: path.join(__dirname, '../build'),
  
  // App info
  appName: 'Deal Clarity Engine',
  appId: 'com.dealclarity.engine',
  productName: 'Deal Clarity Engine',
  version: '1.0.0',
  
  // Publishing (GitHub releases)
  publish: {
    provider: 'github',
    owner: 'abrahamosah74-ux',
    repo: 'deal-clarity-engine'
  },
  
  // Windows
  win: {
    certificateFile: process.env.WIN_CSC_LINK,
    certificatePassword: process.env.WIN_CSC_KEY_PASSWORD,
    signingHashAlgorithms: ['sha256'],
    sign: false // Set to true if you have a code signing certificate
  },
  
  // macOS
  mac: {
    certificateFile: process.env.MAC_CSC_LINK,
    certificatePassword: process.env.MAC_CSC_KEY_PASSWORD,
    identity: null, // Set your identity if code signing
    hardened: true,
    gatekeeperAssess: false
  },
  
  // Auto-update settings
  autoUpdater: {
    channel: 'latest'
  }
};
