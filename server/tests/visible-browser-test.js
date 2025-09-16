#!/usr/bin/env node

/**
 * Simple Browser Launch Test for Fingerprint Evaluation
 * Demonstrates launching ITBrowser with visible windows for anti-detection testing
 */

const axios = require('axios');
const fs = require('fs').promises;

// Configuration
const BASE_URL = 'http://localhost:3000';

async function testVisibleBrowserLaunch() {
  console.log('🧪 ITBrowser Visible Launch Test');
  console.log('='.repeat(35));
  
  try {
    // Check server health
    console.log('\n🏥 Checking server health...');
    const healthResponse = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    console.log(`✅ Server is healthy (uptime: ${Math.round(healthResponse.data.uptime)}s)`);
    
    // Get profiles
    console.log('\n👥 Getting profiles...');
    const profilesResponse = await axios.get(`${BASE_URL}/api/profiles`, { timeout: 10000 });
    const profilesData = profilesResponse.data;
    
    // Handle different response formats
    const profiles = Array.isArray(profilesData) 
      ? profilesData 
      : (profilesData.profiles || []);
    
    if (profiles.length === 0) {
      console.log('❌ No profiles found. Please create profiles first.');
      return;
    }
    
    console.log(`✅ Found ${profiles.length} profiles`);
    
    // Find a profile with an assigned proxy
    const profileWithProxy = profiles.find(profile => 
      profile.assignedProxy && profile.assignedProxy.host
    );
    
    if (!profileWithProxy) {
      console.log('❌ No profiles with assigned proxies found. Please assign proxies to profiles first.');
      return;
    }
    
    console.log(`🎯 Using profile: ${profileWithProxy.name || profileWithProxy.id}`);
    console.log(`📡 Proxy: ${profileWithProxy.assignedProxy.host}:${profileWithProxy.assignedProxy.port}`);
    
    // Launch browser in visible mode
    console.log('\n🚀 Launching browser in visible mode...');
    console.log('🔧 Launch options:');
    console.log('   - headless: false (visible browser)');
    console.log('   - useProxy: true (using assigned proxy)');
    console.log('   - geoip: true (using proxy geolocation)');
    console.log('   - humanize: true (applying humanization)');
    
    const launchOptions = {
      headless: false,    // Visible browser window
      useProxy: true,     // Use assigned proxy
      geoip: true,        // Use proxy geolocation
      humanize: true      // Apply humanization techniques
    };
    
    const launchResponse = await axios.post(
      `${BASE_URL}/api/profiles/${profileWithProxy.id}/launch`,
      launchOptions,
      { timeout: 30000 }
    );
    
    console.log(`✅ Browser launched successfully!`);
    console.log(`📝 Browser ID: ${launchResponse.data.browserId || 'N/A'}`);
    
    // Instructions for manual testing
    console.log('\n🔍 Manual Fingerprint Testing Instructions');
    console.log('-'.repeat(40));
    console.log('1. A visible browser window should now be open');
    console.log('2. Visit these fingerprinting test sites:');
    console.log('   - CreepJS: https://abrahamjuliot.github.io/creepjs/');
    console.log('   - FingerprintJS: https://fingerprintjs.github.io/fingerprintjs/');
    console.log('   - BrowserLeaks: https://browserleaks.com/');
    console.log('   - Panopticlick: https://panopticlick.eff.org/');
    console.log('3. Observe if the browser appears as a regular user browser');
    console.log('4. Check that proxy information is correctly applied');
    console.log('5. Verify that anti-detection features are working');
    
    console.log('\n⏱️  Browser will remain open for 60 seconds for testing...');
    console.log('🔎 Manually test the browser during this time.');
    
    // Wait for manual testing
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    // Close browser instruction
    console.log('\n⏹️  Testing period complete.');
    console.log('📝 In a full implementation, this would close the browser.');
    console.log('📝 For now, please close the browser window manually.');
    
    console.log('\n🎉 Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.log(`📝 Response status: ${error.response.status}`);
      console.log(`📝 Response data:`, JSON.stringify(error.response.data, null, 2));
    }
    
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testVisibleBrowserLaunch();
}

module.exports = { testVisibleBrowserLaunch };