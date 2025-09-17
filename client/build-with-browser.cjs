#!/usr/bin/env node

// Build script that ensures browser is extracted from local zip file or downloads it
const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');
const path = require('path');

// GitHub release URL for the browser
const BROWSER_DOWNLOAD_URL = 'https://github.com/itbrowser-net/undetectable-fingerprint-browser/releases/download/v1.0.0/fingerprint_browser_v1.0.7z';
const BROWSER_ZIP_FILENAME = 'fingerprint_browser_v1.0.7z';

function downloadFile(url, dest, retries = 3) {
  return new Promise((resolve, reject) => {
    const attemptDownload = (retryCount) => {
      console.log(`Download attempt ${4 - retryCount} of 3...`);
      const file = fs.createWriteStream(dest);
      
      https.get(url, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on('finish', () => {
            file.close(() => {
              // Verify the file was downloaded successfully
              fs.stat(dest, (err, stats) => {
                if (err) {
                  console.error('Error getting file stats:', err.message);
                  if (retryCount > 1) {
                    console.log('Retrying download...');
                    setTimeout(() => attemptDownload(retryCount - 1), 1000);
                  } else {
                    reject(new Error('Failed to verify downloaded file'));
                  }
                  return;
                }
                
                if (stats.size === 0) {
                  console.error('Downloaded file is empty');
                  if (retryCount > 1) {
                    console.log('Retrying download...');
                    setTimeout(() => attemptDownload(retryCount - 1), 1000);
                  } else {
                    reject(new Error('Downloaded file is empty'));
                  }
                  return;
                }
                
                console.log(`Download completed! File size: ${stats.size} bytes`);
                resolve();
              });
            });
          });
        } else {
          // Handle redirects
          if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            console.log(`Following redirect to: ${response.headers.location}`);
            attemptDownload(retryCount);
            return;
          } else {
            file.close(() => {
              fs.unlink(dest, () => {}); // Delete the file async
            });
            if (retryCount > 1) {
              console.log(`Server responded with status code ${response.statusCode}, retrying...`);
              setTimeout(() => attemptDownload(retryCount - 1), 1000);
            } else {
              reject(new Error(`Server responded with status code ${response.statusCode}`));
            }
          }
        }
      }).on('error', (err) => {
        file.close(() => {
          fs.unlink(dest, () => {}); // Delete the file async
        });
        if (retryCount > 1) {
          console.log(`Download error: ${err.message}, retrying...`);
          setTimeout(() => attemptDownload(retryCount - 1), 1000);
        } else {
          reject(err);
        }
      });
    };
    
    attemptDownload(retries);
  });
}

async function ensureBrowser() {
  try {
    console.log('Checking for browser files...');
    
    // Check if chrome.exe exists in root
    if (!fs.existsSync('./chrome.exe')) {
      console.log('Chrome executable not found, checking for browser zip file...');
      
      // Check if zip file exists locally
      if (fs.existsSync(`./${BROWSER_ZIP_FILENAME}`)) {
        console.log('Extracting browser from local zip file...');
        // Add a small delay to ensure file is not locked
        await new Promise(resolve => setTimeout(resolve, 1000));
        execSync('7z x ' + BROWSER_ZIP_FILENAME, { stdio: 'inherit' });
        console.log('Browser extracted successfully!');
      } else {
        console.log('Browser zip file not found locally, downloading from GitHub...');
        try {
          await downloadFile(BROWSER_DOWNLOAD_URL, `./${BROWSER_ZIP_FILENAME}`);
          console.log('Extracting downloaded browser zip file...');
          // Add a small delay to ensure file is not locked
          await new Promise(resolve => setTimeout(resolve, 1000));
          execSync('7z x ' + BROWSER_ZIP_FILENAME, { stdio: 'inherit' });
          console.log('Browser extracted successfully!');
        } catch (downloadError) {
          console.error('Failed to download browser:', downloadError.message);
          console.error('Please ensure you have internet connection and 7-Zip installed.');
          process.exit(1);
        }
      }
    } else {
      console.log('Browser files already present.');
    }
  } catch (error) {
    console.error('Error ensuring browser:', error.message);
    process.exit(1);
  }
}

async function main() {
  try {
    await ensureBrowser();
    
    // Continue with regular build
    console.log('Building application...');
    execSync('vite build', { stdio: 'inherit' });
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

main();