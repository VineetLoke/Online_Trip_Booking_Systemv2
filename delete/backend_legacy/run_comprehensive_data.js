#!/usr/bin/env node

/**
 * Run Comprehensive Data Generator
 * This script generates comprehensive flight, train, and hotel data with bidirectional routes
 */

const { generateComprehensiveData } = require('./generate_comprehensive_routes');

async function main() {
  console.log('🚀 Starting Comprehensive Data Generation...');
  console.log('This will generate:');
  console.log('  - Flights with bidirectional routes');
  console.log('  - Trains with bidirectional routes');
  console.log('  - Hotels in all major Indian cities');
  console.log('  - No duplicate records');
  console.log('  - 90 days of data from tomorrow');
  console.log('');
  
  try {
    await generateComprehensiveData();
    console.log('');
    console.log('✅ Data generation completed successfully!');
    console.log('');
    console.log('🎯 What was generated:');
    console.log('  - Bidirectional routes (Delhi ↔ Mumbai, Mumbai ↔ Delhi, etc.)');
    console.log('  - 40+ Indian destinations across all regions');
    console.log('  - Multiple airlines and train operators');
    console.log('  - Diverse hotel options in each city');
    console.log('  - Realistic pricing and availability');
    console.log('');
    console.log('🔍 Now you can search:');
    console.log('  - Delhi to Mumbai → Will show flights/trains');
    console.log('  - Mumbai to Delhi → Will show return flights/trains');
    console.log('  - Any city to any other city → Bidirectional options');
    console.log('');
    console.log('🚀 Ready to test your booking system!');
  } catch (error) {
    console.error('❌ Error generating data:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
