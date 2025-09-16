#!/usr/bin/env node

/**
 * Simple Playwright Test
 * Launches a browser in visible mode to verify the setup
 */

const { chromium } = require('playwright');

async function simplePlaywrightTest() {
  console.log('🧪 Simple Playwright Test');
  console.log('='.repeat(25));

  let browser;
  
  try {
    console.log('\n🚀 Launching browser in visible mode...');
    
    // Launch browser in visible mode
    browser = await chromium.launch({
      headless: false  // This should make the browser visible
    });
    
    console.log('✅ Browser launched successfully!');
    
    // Create a new page
    const page = await browser.newPage();
    
    console.log('\n🌐 Navigating to https://chatgpt.com...');
    await page.goto('https://chatgpt.com');
    
    console.log('✅ Navigation completed!');
    console.log('\n👀 Browser should now be visible on your screen.');
    console.log('🔎 You should see the ChatGPT website.');
    console.log('\n⚠️  The script will close the browser in 30 seconds...');
    
    // Wait for 30 seconds so you can see the browser
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Close the browser
    await browser.close();
    console.log('\n✅ Browser closed successfully.');
    
  } catch (error) {
    console.error('❌ Failed to launch browser:', error.message);
    
    // Close browser if it was opened
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('❌ Failed to close browser:', closeError.message);
      }
    }
    
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  simplePlaywrightTest();
}

module.exports = { simplePlaywrightTest };
