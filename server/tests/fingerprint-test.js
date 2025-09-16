#!/usr/bin/env node

/**
 * Fingerprint Detection Test
 * Tests the anti-detection capabilities of the browser automation system
 * against various fingerprinting services
 */

const { chromium } = require('playwright');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const TEST_SITES = [
  {
    name: 'CreepJS',
    url: 'https://abrahamjuliot.github.io/creepjs/',
    description: 'Advanced browser fingerprinting test'
  },
  {
    name: 'FingerprintJS',
    url: 'https://fingerprintjs.github.io/fingerprintjs/',
    description: 'Popular fingerprinting library demo'
  },
  {
    name: 'ClientJS',
    url: 'https://clientjs.org/',
    description: 'Client-side browser fingerprinting'
  },
  {
    name: 'BrowserLeaks',
    url: 'https://browserleaks.com/',
    description: 'Comprehensive browser leak tests'
  }
];

const OUTPUT_DIR = path.join(__dirname, 'fingerprint-results');
const SCREENSHOT_DELAY = 5000; // 5 seconds

async function setupOutputDirectory() {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Output directory created: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('❌ Failed to create output directory:', error.message);
  }
}

async function runFingerprintTest(testSite, browserContext) {
  console.log(`\n🔍 Testing ${testSite.name}`);
  console.log(`📝 ${testSite.description}`);
  console.log('-'.repeat(50));

  try {
    // Create a new page
    const page = await browserContext.newPage();
    
    // Set viewport to a common size
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log(`🌐 Navigating to ${testSite.url}...`);
    await page.goto(testSite.url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Take screenshot
    const screenshotPath = path.join(OUTPUT_DIR, `${testSite.name.toLowerCase().replace(/\s+/g, '-')}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    
    // Wait for fingerprinting to complete
    console.log('⏱️ Waiting for fingerprinting to complete...');
    await page.waitForTimeout(SCREENSHOT_DELAY);
    
    // Get page content for analysis
    const content = await page.content();
    const contentPath = path.join(OUTPUT_DIR, `${testSite.name.toLowerCase().replace(/\s+/g, '-')}-content.html`);
    await fs.writeFile(contentPath, content);
    console.log(`📄 Page content saved: ${contentPath}`);
    
    // Close the page
    await page.close();
    
    console.log(`✅ ${testSite.name} test completed`);
    return true;
    
  } catch (error) {
    console.error(`❌ Failed to test ${testSite.name}:`, error.message);
    return false;
  }
}

async function runAntiDetectionTest() {
  console.log('🧪 Anti-Detection Fingerprint Test');
  console.log('='.repeat(40));
  
  let browser;
  
  try {
    // Setup output directory
    await setupOutputDirectory();
    
    // Launch browser with anti-detection settings
    console.log('\n🚀 Launching browser with anti-detection settings...');
    
    browser = await chromium.launch({
      headless: false, // Visible mode for observation
      args: [
        '--no-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-plugins-discovery',
        '--disable-default-apps',
        '--no-first-run',
        '--disable-component-update',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-ipc-flooding-protection',
        '--disable-device-discovery-notifications'
      ]
    });
    
    console.log('✅ Browser launched successfully!');
    
    // Create browser context with additional anti-detection settings
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'en-US',
      timezoneId: 'America/New_York',
      geolocation: { latitude: 40.7128, longitude: -74.0060 },
      permissions: [],
      extraHTTPHeaders: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1'
      }
    });
    
    // Add stealth evasion scripts
    await context.addInitScript(() => {
      // Hide webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      // Hide plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      // Hide languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
      
      // Mock chrome object
      window.chrome = {
        runtime: {},
        csi: () => {},
        loadTimes: () => {}
      };
      
      // Hide permissions query
      const originalQuery = navigator.permissions.query;
      navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });
    
    console.log('🛡️  Anti-detection settings applied');
    
    // Run tests for each fingerprinting site
    let passedTests = 0;
    let totalTests = TEST_SITES.length;
    
    for (const testSite of TEST_SITES) {
      const result = await runFingerprintTest(testSite, context);
      if (result) passedTests++;
    }
    
    // Summary
    console.log('\n' + '='.repeat(40));
    console.log('📊 Test Summary');
    console.log('='.repeat(40));
    console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
    console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);
    console.log(`📁 Results saved to: ${OUTPUT_DIR}`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All fingerprint tests completed successfully!');
    } else {
      console.log('⚠️  Some tests failed. Check the results above.');
    }
    
    // Keep browser open for manual inspection
    console.log('\n👀 Browser will remain open for 30 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
  } catch (error) {
    console.error('❌ Failed to run anti-detection test:', error.message);
    
    // Close browser if it was opened
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('❌ Failed to close browser:', closeError.message);
      }
    }
    
    process.exit(1);
  } finally {
    // Close browser
    if (browser) {
      try {
        await browser.close();
        console.log('\n✅ Browser closed successfully.');
      } catch (closeError) {
        console.error('❌ Failed to close browser:', closeError.message);
      }
    }
  }
}

// Run if called directly
if (require.main === module) {
  runAntiDetectionTest();
}

module.exports = { runAntiDetectionTest };