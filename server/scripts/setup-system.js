#!/usr/bin/env node

/**
 * System Setup Script
 * Initializes the web crawler system with profiles, proxies, and configurations
 */

const path = require('path');
const fs = require('fs-extra');

// Set up the environment
process.env.NODE_ENV = 'development';

// Import required modules
const config = require('../src/utils/config');
const logger = require('../src/utils/logger');

async function setupSystem() {
    console.log('🚀 Setting up Nyx itBrowser Automation System');
    console.log('=' .repeat(60));

    try {
        // 1. Ensure required directories exist
        console.log('\n📁 Creating required directories...');
        const directories = [
            config.paths.localStorage,
            config.paths.profiles,
            config.paths.logs,
            './proxies',
            './fingerprints'
        ];

        for (const dir of directories) {
            await fs.ensureDir(dir);
            console.log(`  ✅ ${dir}`);
        }

        // 2. Check proxy files
        console.log('\n🌐 Checking proxy files...');
        const proxyFiles = [
            './proxies/us-proxies.csv',
            './proxies/gb-proxies.csv',
            './proxies/ca-proxies.csv',
            './proxies/au-proxies.csv',
            './proxies/de-proxies.csv',
            './proxies/ar-proxies.csv'
        ];

        for (const file of proxyFiles) {
            const exists = await fs.pathExists(file);
            console.log(`  ${exists ? '✅' : '❌'} ${file} ${exists ? '' : '(missing)'}`);
        }

        // 3. Check browser files
        console.log('\n🌐 Checking browser files...');
        const browserFiles = [
            '../browser/chrome.exe',
            '../browser/itbrowser_fingerprint.exe'
        ];

        for (const file of browserFiles) {
            const exists = await fs.pathExists(file);
            console.log(`  ${exists ? '✅' : '❌'} ${file} ${exists ? '' : '(missing)'}`);
        }

        // 4. Initialize profile pool manager
        console.log('\n👥 Initializing profile system...');
        try {
            const ProfilePoolManager = require('../src/services/profilePoolManager');
            await ProfilePoolManager.initialize();
            console.log('  ✅ Profile system initialized');
            
            const profiles = ProfilePoolManager.getAllProfiles();
            console.log(`  📊 Total profiles: ${profiles.length}`);
            
            // Count by country
            const countryStats = {};
            profiles.forEach(profile => {
                countryStats[profile.countryCode] = (countryStats[profile.countryCode] || 0) + 1;
            });
            
            console.log('  🌍 Country distribution:');
            Object.entries(countryStats).forEach(([country, count]) => {
                const percentage = ((count / profiles.length) * 100).toFixed(1);
                console.log(`    ${country.toUpperCase()}: ${count} profiles (${percentage}%)`);
            });
            
        } catch (error) {
            console.log(`  ❌ Profile system error: ${error.message}`);
        }

        // 5. Test proxy manager
        console.log('\n🔗 Testing proxy system...');
        try {
            const ProxyManager = require('../src/services/proxyManager');
            const proxyManager = new ProxyManager();
            await proxyManager.initialize();
            console.log('  ✅ Proxy system initialized');
            
            const stats = proxyManager.getStats();
            console.log(`  📊 Total proxies: ${stats.totalProxies || 0}`);
            
        } catch (error) {
            console.log(`  ❌ Proxy system error: ${error.message}`);
        }

        // 6. Create sample .env file if it doesn't exist
        console.log('\n⚙️ Checking configuration...');
        const envFile = './.env';
        const envExists = await fs.pathExists(envFile);
        
        if (!envExists) {
            const sampleEnv = `# Nyx itBrowser Automation System Configuration

# Server Configuration
PORT=3000
NODE_ENV=development

# System Settings
PROFILE_COUNT=1000
DAILY_VISIT_TARGET=5000
MAX_CONCURRENT_VISITS=10

# Browser Configuration
BROWSER_HEADLESS=false
BROWSER_TIMEOUT=30000

# Logging
LOG_LEVEL=info

# Target Websites (comma-separated)
TARGET_WEBSITES=https://bot.sannysoft.com,https://example.com

# Proxy Configuration
PROXY_PROVIDER=nodemaven
`;
            await fs.writeFile(envFile, sampleEnv);
            console.log('  ✅ Created sample .env file');
        } else {
            console.log('  ✅ .env file exists');
        }

        console.log('\n🎉 System setup completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('  1. Update .env file with your configuration');
        console.log('  2. Add proxy files to ./proxies/ directory');
        console.log('  3. Run: pnpm start');
        console.log('  4. Test: curl http://localhost:3000/health');
        
        console.log('\n' + '='.repeat(60));

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run setup
if (require.main === module) {
    setupSystem().catch(error => {
        console.error('Unhandled setup error:', error);
        process.exit(1);
    });
}

module.exports = { setupSystem };
