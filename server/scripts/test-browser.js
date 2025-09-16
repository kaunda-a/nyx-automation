#!/usr/bin/env node

/**
 * Test script to verify browser download and extraction
 */

const fs = require('fs');
const path = require('path');

async function testBrowserFiles() {
  console.log('🔍 Testing browser files...');
  
  // Check for required files
  const requiredFiles = [
    './chrome.exe',
    './itbrowser_fingerprint.exe'
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    const exists = fs.existsSync(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
  }
  
  if (allFilesExist) {
    console.log('\n🎉 All browser files are present!');
    return true;
  } else {
    console.log('\n❌ Some browser files are missing.');
    console.log('Please run the download script to fetch the browser files.');
    return false;
  }
}

if (require.main === module) {
  testBrowserFiles();
}