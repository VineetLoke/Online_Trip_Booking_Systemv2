// Clear Database Script for Online Booking System
// This script clears all collections and allows fresh setup

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'online_booking_system';

async function clearDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    console.log('Clearing all collections...');
    
    // Clear all collections
    const collections = ['users', 'flights', 'trains', 'hotels', 'bookings', 'admins'];
    
    for (const collectionName of collections) {
      const result = await db.collection(collectionName).deleteMany({});
      console.log(`Cleared ${result.deletedCount} documents from ${collectionName}`);
    }
    
    console.log('Database cleared successfully!');
    console.log('You can now run database_setup.js to create fresh data.');
    
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await client.close();
  }
}

// Run the script
clearDatabase();
