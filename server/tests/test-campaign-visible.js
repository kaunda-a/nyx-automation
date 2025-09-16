#!/usr/bin/env node

/**
 * Test Campaign with Visible Browser
 * Launches a campaign with the browser in visible mode for testing
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';

async function testCampaignVisible() {
  console.log('🧪 Testing Campaign with Visible Browser');
  console.log('='.repeat(40));

  try {
    // Check server health
    console.log('\n🏥 Checking server health...');
    const healthResponse = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    console.log(`✅ Server is healthy (uptime: ${Math.round(healthResponse.data.uptime)}s)`);

    // Get campaigns
    console.log('\n📋 Getting campaigns...');
    const campaignsResponse = await axios.get(`${BASE_URL}/api/campaigns`, { timeout: 10000 });
    const campaigns = campaignsResponse.data;
    
    if (!Array.isArray(campaigns)) {
      console.log('❌ Unexpected campaigns response format');
      console.log(JSON.stringify(campaigns, null, 2));
      return;
    }
    
    if (campaigns.length === 0) {
      console.log('❌ No campaigns found. Please create a campaign first.');
      return;
    }
    
    // Find an active campaign
    const activeCampaign = campaigns.find(c => c.status === 'active');
    if (!activeCampaign) {
      console.log('❌ No active campaigns found. Please activate a campaign first.');
      return;
    }
    
    console.log(`✅ Using campaign: ${activeCampaign.name} (${activeCampaign.id})`);

    // Get profiles
    console.log('\n👥 Getting profiles...');
    const profilesResponse = await axios.get(`${BASE_URL}/api/profiles`, { timeout: 10000 });
    const profilesData = profilesResponse.data;
    const profiles = profilesData.profiles || profilesData;
    
    if (!Array.isArray(profiles)) {
      console.log('❌ Unexpected profiles response format');
      console.log(JSON.stringify(profilesData, null, 2));
      return;
    }
    
    if (profiles.length === 0) {
      console.log('❌ No profiles found. Please create profiles first.');
      return;
    }
    
    console.log(`✅ Found ${profiles.length} profiles`);

    // Launch campaign with visible browser using enhanced workflow
    console.log(`\n🚀 Launching campaign with visible browser (enhanced workflow)...`);
    
    const launchData = {
      profileCount: 1,
      useEnhanced: true,  // Use enhanced workflow which uses Playwright
      options: {
        headless: false,  // This will make the browser visible
        adInteraction: true,
        sessionDuration: 30
      }
    };
    
    console.log(`Sending launch request for campaign ${activeCampaign.id}...`);
    const launchResponse = await axios.post(
      `${BASE_URL}/api/campaigns/${activeCampaign.id}/launch`, 
      launchData, 
      { timeout: 30000 }
    );
    
    console.log(`✅ Campaign launch initiated successfully!`);
    console.log(`📝 Job ID: ${launchResponse.data.data.jobId}`);
    console.log(`📝 Workflow: ${launchResponse.data.data.workflow}`);
    
    console.log('\n' + '='.repeat(40));
    console.log('🎉 Campaign launched with visible browser!');
    console.log(`Campaign: ${activeCampaign.name}`);
    console.log(`Job ID: ${launchResponse.data.data.jobId}`);
    console.log('\n👀 You should now see the browser window open and navigate to the target website.');
    console.log('🔎 Watch the browser to see the automation in action.');
    
  } catch (error) {
    console.error('❌ Failed to launch campaign:', error.message);
    if (error.response?.data) {
      console.log(`📝 Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testCampaignVisible();
}

module.exports = { testCampaignVisible };
