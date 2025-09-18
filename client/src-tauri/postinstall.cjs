#!/usr/bin/env node

/**
 * Simple Post-Installation Script for Nyx Crawler Bot
 * Extracts the fingerprint browser after installation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function main() {
  try {
    console.log('\x1b[36m🚀 Starting Nyx Crawler Bot post-installation setup...\x1b[0m');
    console.log('='.repeat(60));
    
    // Get installation directory
    const installDir = process.cwd();
    console.log(`\x1b[34m[INFO]\x1b[0m Installation directory: ${installDir}`);
    
    // Extract browser archive
    const browserArchive = path.join(installDir, 'browser', 'fingerprint_browser_v1.0.7z');
    const extractDir = installDir;
    
    if (fs.existsSync(browserArchive)) {
      console.log(`\x1b[34m[INFO]\x1b[0m Extracting browser from: ${browserArchive}`);
      console.log(`\x1b[34m[INFO]\x1b[0m Extracting to: ${extractDir}`);
      
      // Extract using 7-Zip
      execSync(`7z x "${browserArchive}" -o"${extractDir}" -y`, { 
        stdio: 'inherit',
        cwd: installDir
      });
      
      console.log('\x1b[32m[SUCCESS]\x1b[0m Browser extracted successfully!');
      
      // Clean up archive file
      fs.unlinkSync(browserArchive);
      console.log('\x1b[32m[SUCCESS]\x1b[0m Browser archive cleaned up!');
    } else {
      console.log('\x1b[33m[WARN]\x1b[0m Browser archive not found, skipping extraction');
    }
    
    console.log('\n\x1b[32m🎉 Nyx Crawler Bot post-installation setup completed!\x1b[0m');
    console.log('\x1b[32m✅ Browser extracted to installation directory\x1b[0m');
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error(`\x1b[31m❌ Post-installation setup failed: ${error.message}\x1b[0m`);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}