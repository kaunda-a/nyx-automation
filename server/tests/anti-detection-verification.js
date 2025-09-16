#!/usr/bin/env node

/**
 * Anti-Detection Feature Verification Test
 * Verifies that ITBrowser's anti-detection features are properly configured
 */

const axios = require('axios');
const fs = require('fs').promises;

// Configuration
const BASE_URL = 'http://localhost:3000';

async function verifyAntiDetectionFeatures() {
  console.log('🛡️  ITBrowser Anti-Detection Feature Verification');
  console.log('='.repeat(45));
  
  try {
    // Check server health
    console.log('\n🏥 Checking server health...');
    const healthResponse = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    console.log(`✅ Server is healthy (uptime: ${Math.round(healthResponse.data.uptime)}s)`);
    
    // Get profiles to check anti-detection features
    console.log('\n👥 Checking profiles for anti-detection features...');
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
    
    // Check anti-detection features for each profile
    let profilesWithFeatures = 0;
    let profilesWithProxies = 0;
    
    for (const profile of profiles) {
      console.log(`\n🔍 Checking profile: ${profile.name || profile.id}`);
      
      // Check for fingerprint data
      if (profile.fingerprint && Object.keys(profile.fingerprint).length > 0) {
        console.log('   ✅ Fingerprint data present');
        
        // Check specific fingerprint properties
        const fp = profile.fingerprint;
        if (fp.userAgent) console.log('   ✅ User Agent spoofing configured');
        if (fp.viewport) console.log('   ✅ Viewport configuration present');
        if (fp.geolocation) console.log('   ✅ Geolocation data present');
        if (fp.timezone) console.log('   ✅ Timezone configuration present');
        if (fp.language) console.log('   ✅ Language configuration present');
        
        profilesWithFeatures++;
      } else {
        console.log('   ⚠️  No fingerprint data found');
      }
      
      // Check for assigned proxy
      if (profile.assignedProxy && profile.assignedProxy.host) {
        console.log(`   ✅ Proxy assigned: ${profile.assignedProxy.host}:${profile.assignedProxy.port}`);
        console.log(`   🌍 Proxy location: ${profile.assignedProxy.country || 'Unknown'}`);
        profilesWithProxies++;
      } else {
        console.log('   ⚠️  No proxy assigned');
      }
      
      // Check for anti-detection configuration
      if (profile.config) {
        console.log('   ✅ Profile configuration present');
        
        // Check specific anti-detection settings
        const config = profile.config;
        if (config.category) console.log(`   🎯 Profile category: ${config.category}`);
        if (config.os) console.log(`   💻 Operating system: ${config.os}`);
        if (config.browser) console.log(`   🌐 Browser type: ${config.browser}`);
        if (config.device) console.log(`   📱 Device type: ${config.device}`);
      } else {
        console.log('   ⚠️  No profile configuration found');
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(45));
    console.log('📊 Anti-Detection Feature Verification Summary');
    console.log('='.repeat(45));
    console.log(`✅ Profiles with fingerprint data: ${profilesWithFeatures}/${profiles.length}`);
    console.log(`✅ Profiles with assigned proxies: ${profilesWithProxies}/${profiles.length}`);
    
    // Overall assessment
    if (profilesWithFeatures > 0 && profilesWithProxies > 0) {
      console.log('\n🎉 Anti-detection features are properly configured!');
      console.log('🛡️  Your ITBrowser setup has the necessary anti-detection capabilities.');
    } else if (profilesWithFeatures > 0) {
      console.log('\n⚠️  Partial anti-detection configuration detected.');
      console.log('📝 Profiles have fingerprint data but lack proxy assignments.');
      console.log('💡 Assign proxies to profiles for full anti-detection capability.');
    } else if (profilesWithProxies > 0) {
      console.log('\n⚠️  Partial anti-detection configuration detected.');
      console.log('📝 Profiles have proxies but lack fingerprint data.');
      console.log('💡 Generate fingerprint data for profiles for full anti-detection capability.');
    } else {
      console.log('\n❌ Anti-detection features are not properly configured.');
      console.log('📝 No profiles have fingerprint data or proxy assignments.');
      console.log('💡 Configure fingerprint data and assign proxies to profiles.');
    }
    
    // Recommendations
    console.log('\n💡 Recommendations for Enhanced Anti-Detection');
    console.log('-'.repeat(45));
    console.log('1. Ensure all profiles have both fingerprint data and assigned proxies');
    console.log('2. Use diverse fingerprint configurations across profiles');
    console.log('3. Rotate proxies regularly to avoid detection');
    console.log('4. Vary browser configurations (user agents, viewports, etc.)');
    console.log('5. Implement realistic browsing behavior patterns');
    console.log('6. Use geographically diverse proxies matching fingerprint locations');
    
    // Test launching a browser with anti-detection features
    console.log('\n🧪 Testing Browser Launch with Anti-Detection');
    console.log('-'.repeat(40));
    
    const testProfile = profiles.find(p => 
      p.fingerprint && Object.keys(p.fingerprint).length > 0 && 
      p.assignedProxy && p.assignedProxy.host
    );
    
    if (testProfile) {
      console.log(`🎯 Testing with profile: ${testProfile.name || testProfile.id}`);
      console.log('🔧 Launch configuration:');
      console.log('   - headless: false (visible browser for testing)');
      console.log('   - useProxy: true (using assigned proxy)');
      console.log('   - geoip: true (matching fingerprint location)');
      console.log('   - humanize: true (applying humanization)');
      
      console.log('\n🚀 Launch command (for manual testing):');
      console.log(`   POST ${BASE_URL}/api/profiles/${testProfile.id}/launch`);
      console.log('   Body: { "headless": false, "useProxy": true, "geoip": true, "humanize": true }');
      
      console.log('\n✅ Ready for manual browser launch testing!');
      console.log('📝 Use the above command to launch a browser and test anti-detection features.');
    } else {
      console.log('❌ No suitable profile found for testing.');
      console.log('📝 Create a profile with both fingerprint data and assigned proxy for testing.');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    
    if (error.response) {
      console.log(`📝 Response status: ${error.response.status}`);
      console.log(`📝 Response data:`, JSON.stringify(error.response.data, null, 2));
    }
    
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  verifyAntiDetectionFeatures();
}

module.exports = { verifyAntiDetectionFeatures };