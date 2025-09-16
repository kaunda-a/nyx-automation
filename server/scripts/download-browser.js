#!/usr/bin/env node

/**
 * Browser Download and Extraction Script
 * Downloads the fingerprint browser from GitHub and extracts it for use with Playwright
 */

const https = require('https');
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');

// GitHub release URL for the fingerprint browser
const BROWSER_DOWNLOAD_URL = 'https://github.com/itbrowser-net/undetectable-fingerprint-browser/releases/download/v1.0.0/fingerprint_browser_v1.0.7z';
const DOWNLOAD_FILE_NAME = 'fingerprint_browser_v1.0.7z';
const EXTRACT_DIR = './browser';

async function downloadFile(url, destination) {
  console.log(`Downloading browser from ${url}...`);
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        file.close();
        fs.removeSync(destination);
        return downloadFile(response.headers.location, destination)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.removeSync(destination);
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
        fs.removeSync(destination);
        reject(err);
      });
    }).on('error', (err) => {
      file.close();
      fs.removeSync(destination);
      reject(err);
    });
  });
}

async function extractArchive(archivePath, extractPath) {
  console.log('Extracting browser archive...');
  
  // Check if 7z is available
  try {
    const sevenZipExists = await checkCommandExists('7z');
    if (!sevenZipExists) {
      throw new Error('7-Zip (7z) is not installed or not in PATH. Please install 7-Zip to extract the browser.');
    }
    
    // Create extract directory
    await fs.ensureDir(extractPath);
    
    // Extract using 7z
    const extractProcess = spawn('7z', ['x', archivePath, `-o${extractPath}`, '-y'], {
      stdio: 'inherit',
      shell: true
    });
    
    return new Promise((resolve, reject) => {
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
  } catch (error) {
    throw new Error(`Failed to extract archive: ${error.message}`);
  }
}

function checkCommandExists(command) {
  return new Promise((resolve) => {
    const process = spawn(command, ['--help'], {
      stdio: 'ignore',
      shell: true
    });
    
    process.on('close', (code) => {
      resolve(code === 0);
    });
    
    process.on('error', () => {
      resolve(false);
    });
  });
}

async function moveBrowserFiles() {
  console.log('Moving browser files to correct locations...');
  
  // Check if we have a version-specific directory
  const files = await fs.readdir(EXTRACT_DIR);
  const versionDir = files.find(file => 
    fs.statSync(path.join(EXTRACT_DIR, file)).isDirectory() && 
    file.includes('.') // Likely a version number
  );
  
  if (versionDir) {
    console.log(`Found version directory: ${versionDir}`);
    const versionPath = path.join(EXTRACT_DIR, versionDir);
    
    // Move chrome.exe to root
    const chromePath = path.join(versionPath, 'chrome.exe');
    if (await fs.pathExists(chromePath)) {
      await fs.move(chromePath, './chrome.exe', { overwrite: true });
      console.log('Moved chrome.exe to root directory');
    }
    
    // Move itbrowser_fingerprint.exe to root
    const fingerprintPath = path.join(versionPath, 'itbrowser_fingerprint.exe');
    if (await fs.pathExists(fingerprintPath)) {
      await fs.move(fingerprintPath, './itbrowser_fingerprint.exe', { overwrite: true });
      console.log('Moved itbrowser_fingerprint.exe to root directory');
    }
    
    // Clean up empty version directory
    await fs.remove(versionPath);
  } else {
    console.log('No version directory found, assuming flat structure');
  }
  
  console.log('Browser files moved successfully!');
}

async function main() {
  try {
    console.log('🚀 Starting browser download and extraction process');
    console.log('='.repeat(60));
    
    // Check if browser already exists
    const chromeExists = await fs.pathExists('./chrome.exe');
    const fingerprintExists = await fs.pathExists('./itbrowser_fingerprint.exe');
    
    if (chromeExists && fingerprintExists) {
      console.log('✅ Browser files already exist, skipping download');
      return;
    }
    
    // Download browser archive
    await downloadFile(BROWSER_DOWNLOAD_URL, DOWNLOAD_FILE_NAME);
    
    // Extract archive
    await extractArchive(DOWNLOAD_FILE_NAME, EXTRACT_DIR);
    
    // Move files to correct locations
    await moveBrowserFiles();
    
    // Clean up archive file
    await fs.remove(DOWNLOAD_FILE_NAME);
    console.log('Cleaned up temporary archive file');
    
    console.log('\n🎉 Browser download and extraction completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('  1. Run the server: pnpm start');
    console.log('  2. The system will now use the downloaded browser for automation');
    
    console.log('\n' + '='.repeat(60));
  } catch (error) {
    console.error('❌ Browser setup failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { main };