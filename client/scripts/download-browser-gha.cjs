#!/usr/bin/env node

/**
 * GitHub Actions Browser Download Script
 * Downloads and extracts the fingerprint browser for use in GitHub Actions
 */

const https = require('https');
const fs = require('fs');
const { spawn } = require('child_process');

// GitHub release URL for the fingerprint browser
const BROWSER_DOWNLOAD_URL = 'https://github.com/itbrowser-net/undetectable-fingerprint-browser/releases/download/v1.0.0/fingerprint_browser_v1.0.7z';
const DOWNLOAD_FILE_NAME = 'fingerprint_browser_v1.0.7z';

function downloadFile(url, destination) {
  console.log(`Downloading browser from ${url}...`);
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        file.close();
        fs.unlinkSync(destination);
        return downloadFile(response.headers.location, destination)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destination);
        return reject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`));
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('Download completed!');
        resolve();
      });
      
      file.on('error', (err) => {
        file.close();
        fs.unlinkSync(destination);
        reject(err);
      });
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(destination);
      reject(err);
    });
  });
}

function extractArchive(archivePath) {
  console.log('Extracting browser archive...');
  
  return new Promise((resolve, reject) => {
    const extractProcess = spawn('7z', ['x', archivePath], {
      stdio: 'inherit',
      shell: true
    });
    
    extractProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Extraction completed successfully!');
        resolve();
      } else {
        reject(new Error(`Extraction failed with exit code ${code}`));
      }
    });
    
    extractProcess.on('error', (err) => {
      reject(new Error(`Failed to start extraction process: ${err.message}`));
    });
  });
}

async function main() {
  try {
    console.log('🚀 Starting browser download and extraction for GitHub Actions');
    console.log('='.repeat(70));
    
    // Download browser archive
    await downloadFile(BROWSER_DOWNLOAD_URL, DOWNLOAD_FILE_NAME);
    
    // Extract archive
    await extractArchive(DOWNLOAD_FILE_NAME);
    
    // Clean up archive file
    fs.unlinkSync(DOWNLOAD_FILE_NAME);
    console.log('Cleaned up temporary archive file');
    
    console.log('\n🎉 Browser download and extraction completed successfully!');
    console.log('\n' + '='.repeat(70));
  } catch (error) {
    console.error('❌ Browser setup failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}
