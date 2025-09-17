#!/usr/bin/env node

// Build script that ensures browser is extracted from local zip file
const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log('Checking for browser files...');
  
  // Check if chrome.exe exists in root
  if (!fs.existsSync('./chrome.exe')) {
    console.log('Chrome executable not found, extracting browser from local zip file...');
    
    // Check if zip file exists locally
    if (fs.existsSync('./fingerprint_browser_v1.0.7z')) {
      console.log('Extracting browser from local zip file...');
      execSync('7z x fingerprint_browser_v1.0.7z', { stdio: 'inherit' });
      console.log('Browser extracted successfully!');
    } else {
      console.error('Browser zip file not found!');
      console.error('Please ensure fingerprint_browser_v1.0.7z is in the project root directory.');
      process.exit(1);
    }
  } else {
    console.log('Browser files already present.');
  }
  
  // Continue with regular build
  console.log('Building application...');
  execSync('vite build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}