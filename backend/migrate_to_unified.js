#!/usr/bin/env node

/**
 * Migration Script - Old Data Management to Unified System
 * 
 * This script helps migrate from the old individual data management files
 * to the new unified data_manager.js system.
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Migration Script - Old Data Management to Unified System\n');

// List of old files to be replaced
const oldFiles = [
  'add_new_records.js',
  'clear_database.js', 
  'generate_comprehensive_data.js',
  'generate_sample_bookings.js'
];

// Check which old files exist
console.log('📋 Checking for old data management files...\n');

const existingOldFiles = [];
oldFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    existingOldFiles.push(file);
    console.log(`   ✅ Found: ${file}`);
  } else {
    console.log(`   ❌ Not found: ${file}`);
  }
});

console.log(`\n📊 Summary: ${existingOldFiles.length}/${oldFiles.length} old files found\n`);

// Check if new unified system exists
const newFile = 'data_manager.js';
const newFilePath = path.join(__dirname, newFile);

if (fs.existsSync(newFilePath)) {
  console.log(`✅ New unified system found: ${newFile}\n`);
} else {
  console.log(`❌ New unified system not found: ${newFile}\n`);
  console.log('Please ensure data_manager.js is in the backend directory.\n');
  process.exit(1);
}

// Show migration recommendations
console.log('🎯 Migration Recommendations:\n');

if (existingOldFiles.length > 0) {
  console.log('1. BACKUP YOUR DATA (if needed):');
  console.log('   - Export important data from your database');
  console.log('   - Note down any custom configurations\n');
  
  console.log('2. SETUP ENVIRONMENT:');
  console.log('   - Copy env.example to .env');
  console.log('   - Update MongoDB URI and JWT secret\n');
  
  console.log('3. RUN UNIFIED SETUP:');
  console.log('   node data_manager.js --action=setup\n');
  
  console.log('4. VERIFY MIGRATION:');
  console.log('   node data_manager.js --action=stats\n');
  
  console.log('5. CLEANUP (optional):');
  console.log('   - Remove old files after successful migration');
  console.log('   - Update any scripts that reference old files\n');
} else {
  console.log('✅ No old files found - you can proceed directly with the unified system!\n');
  console.log('1. SETUP ENVIRONMENT:');
  console.log('   - Copy env.example to .env');
  console.log('   - Update MongoDB URI and JWT secret\n');
  
  console.log('2. RUN UNIFIED SETUP:');
  console.log('   node data_manager.js --action=setup\n');
}

// Show equivalent commands
console.log('🔄 Command Equivalents:\n');

const equivalents = [
  { old: 'node add_new_records.js', new: 'node data_manager.js --action=generate --type=all --days=7' },
  { old: 'node clear_database.js', new: 'node data_manager.js --action=clear' },
  { old: 'node generate_comprehensive_data.js', new: 'node data_manager.js --action=generate --type=all --days=30' },
  { old: 'node generate_sample_bookings.js', new: 'node data_manager.js --action=add-sample --count=50' }
];

equivalents.forEach(({ old, new: newCmd }) => {
  console.log(`   Old: ${old}`);
  console.log(`   New: ${newCmd}\n`);
});

// Show new features
console.log('✨ New Features in Unified System:\n');
console.log('   • Environment configuration support');
console.log('   • Batch processing for large datasets');
console.log('   • Better error handling and validation');
console.log('   • CLI interface with options');
console.log('   • Database statistics');
console.log('   • Confirmation prompts for destructive operations');
console.log('   • Schema validation');
console.log('   • Memory-efficient data generation\n');

// Show help
console.log('📖 For more information:');
console.log('   - Read DATA_MANAGEMENT_README.md');
console.log('   - Run: node data_manager.js --action=help\n');

console.log('🚀 Ready to migrate! Run the setup command when ready.\n');
