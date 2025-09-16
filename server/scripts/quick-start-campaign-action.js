#!/usr/bin/env node

/**
 * Quick Campaign Action Starter
 * Quickly starts a campaign action with minimal configuration
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';

async function quickStartCampaignAction() {
  console.log('⚡ Quick Campaign Action Starter');
  console.log('='.repeat(30));

  try {
    // Check server health
    console.log('\n🏥 Checking server health...');
    const healthResponse = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    console.log(`✅ Server is healthy (uptime: ${Math.round(healthResponse.data.uptime)}s)`);

    // Get campaigns
    console.log('\n📋 Getting campaigns...');
    const campaignsResponse = await axios.get(`${BASE_URL}/api/campaigns`, { timeout: 10000 });
    const campaigns = campaignsResponse.data;
    
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
    
    console.log(`✅ Using campaign: ${activeCampaign.name}`);

    // Get profiles
    console.log('\n👥 Getting profiles...');
    const profilesResponse = await axios.get(`${BASE_URL}/api/profiles`, { timeout: 10000 });
    const profiles = profilesResponse.data.profiles || profilesResponse.data;
    
    if (profiles.length === 0) {
      console.log('❌ No profiles found. Please create profiles first.');
      return;
    }
    
    console.log(`✅ Found ${profiles.length} profiles`);

    // Launch first profile with the active campaign
    const profileToLaunch = profiles[0];
    console.log(`\n🚀 Launching profile ${profileToLaunch.id} for campaign...`);
    
    const launchData = {
      campaignId: activeCampaign.id,
      options: {
        headless: true,
        adInteraction: true,
        sessionDuration: 10
      }
    };
    
    const launchResponse = await axios.post(
      `${BASE_URL}/api/profiles/${profileToLaunch.id}/launch`, 
      launchData, 
      { timeout: 30000 }
    );
    
    console.log(`✅ Profile launch initiated successfully!`);
    console.log(`📝 Event ID: ${launchResponse.data.eventId}`);
    
    console.log('\n' + '='.repeat(30));
    console.log('🎉 Campaign action started successfully!');
    console.log(`Campaign: ${activeCampaign.name}`);
    console.log(`Profile: ${profileToLaunch.id}`);
    console.log(`Event ID: ${launchResponse.data.eventId}`);
    console.log('\n📊 Monitor the Inngest dashboard for execution details.');
    
  } catch (error) {
    console.error('❌ Failed to start campaign action:', error.message);
    if (error.response?.data) {
      console.log(`📝 Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  quickStartCampaignAction();
}

module.exports = { quickStartCampaignAction };