#!/usr/bin/env node

// Simple build script that skips type checking
const { execSync } = require('child_process');

try {
  console.log('Building without type checking...');
  execSync('vite build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}