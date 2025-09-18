#!/usr/bin/env node

/**
 * Comprehensive Build Script for Nyx Crawler Bot
 * Downloads browser, builds server executable, and prepares complete application package
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

class NyxBuildOrchestrator {
  constructor() {
    this.rootDir = path.resolve(__dirname, '../..');
    this.clientDir = path.join(this.rootDir, 'client');
    this.serverDir = path.join(this.rootDir, 'server');
    this.buildDir = path.join(this.clientDir, 'src-tauri', 'target', 'release', 'bundle');
  }

  log(message) {
    console.log(`\x1b[34m[INFO]\x1b[0m ${message}`);
  }

  success(message) {
    console.log(`\x1b[32m[SUCCESS]\x1b[0m ${message}`);
  }

  warn(message) {
    console.log(`\x1b[33m[WARN]\x1b[0m ${message}`);
  }

  error(message) {
    console.log(`\x1b[31m[ERROR]\x1b[0m ${message}`);
  }

  /**
   * Download and extract the fingerprint browser
   */
  async downloadBrowser() {
    this.log('Downloading fingerprint browser...');
    
    try {
      // Run the browser download script
      execSync('node scripts/download-browser-gha.cjs', { 
        cwd: this.clientDir, 
        stdio: 'inherit' 
      });
      
      this.success('Browser downloaded successfully');
      return true;
    } catch (error) {
      this.error(`Failed to download browser: ${error.message}`);
      return false;
    }
  }

  /**
   * Build the server executable
   */
  async buildServerExecutable() {
    this.log('Building server executable...');
    
    try {
      // Navigate to server directory and build executable
      const serverBuildDir = path.join(this.serverDir, 'dist');
      fs.ensureDirSync(serverBuildDir);
      
      // Use pkg to create executable (you'll need to install pkg globally: npm install -g pkg)
      execSync('pkg . --targets node18-win-x64 --output dist/nyx-server.exe', { 
        cwd: this.serverDir, 
        stdio: 'inherit' 
      });
      
      this.success('Server executable built successfully');
      return true;
    } catch (error) {
      this.warn(`Failed to build server executable with pkg: ${error.message}`);
      this.log('Falling back to using Node.js scripts...');
      
      // Ensure server files are copied to dist directory
      const serverFiles = [
        'start.js',
        'app.js',
        'package.json'
      ];
      
      const serverDistDir = path.join(this.serverDir, 'dist');
      fs.ensureDirSync(serverDistDir);
      
      for (const file of serverFiles) {
        const src = path.join(this.serverDir, file);
        const dest = path.join(serverDistDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
          this.log(`Copied ${file} to dist directory`);
        }
      }
      
      // Copy node_modules if they exist
      const nodeModulesSrc = path.join(this.serverDir, 'node_modules');
      const nodeModulesDest = path.join(serverDistDir, 'node_modules');
      if (fs.existsSync(nodeModulesSrc)) {
        fs.copySync(nodeModulesSrc, nodeModulesDest);
        this.log('Copied node_modules to dist directory');
      }
      
      this.success('Server files prepared for distribution');
      return true;
    }
  }

  /**
   * Organize files for proper application structure
   */
  async organizeFiles() {
    this.log('Organizing files for proper application structure...');
    
    try {
      // Copy browser files to the correct location
      const browserSrc = path.join(this.clientDir, 'browser');
      const browserDest = path.join(this.clientDir, 'src-tauri', 'browser');
      
      if (fs.existsSync(browserSrc)) {
        fs.copySync(browserSrc, browserDest);
        this.log('Copied browser files to Tauri directory');
      }
      
      // Copy server files to the correct location
      const serverSrc = path.join(this.serverDir, 'dist');
      const serverDest = path.join(this.clientDir, 'src-tauri', 'server');
      
      if (fs.existsSync(serverSrc)) {
        fs.copySync(serverSrc, serverDest);
        this.log('Copied server files to Tauri directory');
      }
      
      this.success('Files organized successfully');
      return true;
    } catch (error) {
      this.error(`Failed to organize files: ${error.message}`);
      return false;
    }
  }

  /**
   * Build the complete application
   */
  async buildApplication() {
    this.log('Building complete Nyx Crawler Bot application...');
    
    try {
      // Change to client directory
      process.chdir(this.clientDir);
      
      // Install dependencies
      this.log('Installing frontend dependencies...');
      execSync('pnpm install', { stdio: 'inherit' });
      
      // Build frontend
      this.log('Building frontend...');
      execSync('pnpm build', { stdio: 'inherit' });
      
      // Download browser
      const browserSuccess = await this.downloadBrowser();
      if (!browserSuccess) {
        this.warn('Browser download failed, continuing with build...');
      }
      
      // Build server executable
      const serverSuccess = await this.buildServerExecutable();
      if (!serverSuccess) {
        this.error('Server build failed');
        return false;
      }
      
      // Organize files
      const organizeSuccess = await this.organizeFiles();
      if (!organizeSuccess) {
        this.error('File organization failed');
        return false;
      }
      
      // Build Tauri application
      this.log('Building Tauri application...');
      execSync('pnpm tauri build', { stdio: 'inherit' });
      
      this.success('Complete application built successfully!');
      return true;
    } catch (error) {
      this.error(`Failed to build application: ${error.message}`);
      return false;
    }
  }

  /**
   * Main build process
   */
  async run() {
    this.log('🚀 Starting Nyx Crawler Bot build process...');
    this.log(`Working directory: ${this.rootDir}`);
    
    const success = await this.buildApplication();
    
    if (success) {
      this.success('🎉 Build process completed successfully!');
      this.log(`Application bundle available at: ${this.buildDir}`);
    } else {
      this.error('💥 Build process failed!');
      process.exit(1);
    }
  }
}

// Run the build orchestrator
if (require.main === module) {
  const builder = new NyxBuildOrchestrator();
  builder.run().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { NyxBuildOrchestrator };