// init-storage.js
const fs = require('fs-extra');
const path = require('path');

async function initStorage() {
  try {
    // Create required directories
    const dirs = [
      'localStorage',
      'localStorage/data',
      'localStorage/data/campaigns',
      'localStorage/profiles',
      'localStorage/proxies',
      'localStorage/logs',
      'localStorage/fingerprints',
      'localStorage/uploads'
    ];
    
    for (const dir of dirs) {
      const fullPath = path.join(__dirname, dir);
      await fs.ensureDir(fullPath);
      console.log(`Created directory: ${fullPath}`);
    }
    
    console.log('Storage initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing storage:', error.message);
    throw error;
  }
}

initStorage();