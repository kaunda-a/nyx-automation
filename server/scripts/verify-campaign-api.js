#!/usr/bin/env node

// Script to verify that campaign API endpoints are properly exposed
const fs = require('fs');
const path = require('path');

console.log('Verifying campaign API endpoints...\n');

// Check if the campaign routes file exists
const campaignRoutesPath = path.join(__dirname, 'src', 'routes', 'campaigns.js');
if (fs.existsSync(campaignRoutesPath)) {
  console.log('✓ Campaign routes file exists');
  
  // Read the file to verify the launch endpoint is defined
  const routesContent = fs.readFileSync(campaignRoutesPath, 'utf8');
  if (routesContent.includes('launch')) {
    console.log('✓ Campaign launch endpoint is defined');
  } else {
    console.log('✗ Campaign launch endpoint not found in routes');
  }
} else {
  console.log('✗ Campaign routes file does not exist');
}

// Check if the campaign controller exists
const campaignControllerPath = path.join(__dirname, 'src', 'controllers', 'campaignController.js');
if (fs.existsSync(campaignControllerPath)) {
  console.log('✓ Campaign controller file exists');
  
  // Read the file to verify the launch method is defined
  const controllerContent = fs.readFileSync(campaignControllerPath, 'utf8');
  if (controllerContent.includes('launchCampaign')) {
    console.log('✓ Campaign launch method is defined in controller');
  } else {
    console.log('✗ Campaign launch method not found in controller');
  }
} else {
  console.log('✗ Campaign controller file does not exist');
}

// Check if the main routes file includes campaign routes
const mainRoutesPath = path.join(__dirname, 'src', 'routes', 'index.js');
if (fs.existsSync(mainRoutesPath)) {
  console.log('✓ Main routes file exists');
  
  // Read the file to verify campaign routes are mounted
  const mainRoutesContent = fs.readFileSync(mainRoutesPath, 'utf8');
  if (mainRoutesContent.includes('campaignRoutes')) {
    console.log('✓ Campaign routes are mounted in main routes');
  } else {
    console.log('✗ Campaign routes not mounted in main routes');
  }
} else {
  console.log('✗ Main routes file does not exist');
}

// Check if app.js includes the API routes
const appPath = path.join(__dirname, 'app.js');
if (fs.existsSync(appPath)) {
  console.log('✓ App file exists');
  
  // Read the file to verify API routes are mounted
  const appContent = fs.readFileSync(appPath, 'utf8');
  if (appContent.includes('/api')) {
    console.log('✓ API routes are mounted in app');
  } else {
    console.log('✗ API routes not mounted in app');
  }
} else {
  console.log('✗ App file does not exist');
}

console.log('\nCampaign API verification completed.');