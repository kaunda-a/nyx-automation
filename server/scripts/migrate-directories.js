// migrate-directories.js
const fs = require('fs-extra');
const path = require('path');

async function migrateDirectories() {
  try {
    console.log('Starting directory migration...');
    
    // Check if old data directory exists and migrate it
    const oldDataDir = path.join(__dirname, 'data');
    const newDataDir = path.join(__dirname, 'localStorage', 'data');
    
    if (await fs.pathExists(oldDataDir)) {
      console.log('Found old data directory, migrating contents...');
      await fs.copy(oldDataDir, newDataDir);
      console.log('Migration complete, removing old directory...');
      await fs.remove(oldDataDir);
      console.log('Old data directory removed');
    }
    
    // Check if old uploads directory exists and migrate it
    const oldUploadsDir = path.join(__dirname, 'uploads');
    const newUploadsDir = path.join(__dirname, 'localStorage', 'uploads');
    
    if (await fs.pathExists(oldUploadsDir)) {
      console.log('Found old uploads directory, migrating contents...');
      await fs.copy(oldUploadsDir, newUploadsDir);
      console.log('Migration complete, removing old directory...');
      await fs.remove(oldUploadsDir);
      console.log('Old uploads directory removed');
    }
    
    console.log('Directory migration completed successfully!');
    
  } catch (error) {
    console.error('Error during directory migration:', error.message);
    throw error;
  }
}

// Run migration if script is called directly
if (require.main === module) {
  migrateDirectories().catch(error => {
    console.error('Migration failed:', error.message);
    process.exit(1);
  });
}

module.exports = { migrateDirectories };