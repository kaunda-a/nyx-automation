// Script to manually register workflows
console.log('Registering workflows...');

// Import workflow files to trigger registration
require('./src/workflows/campaignLaunch');
require('./src/workflows/enhancedCampaignLaunch');
require('./src/workflows/batchCampaignLaunch');

console.log('Workflows registered successfully');