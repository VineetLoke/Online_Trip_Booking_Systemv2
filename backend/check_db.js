const { MongoClient } = require('mongodb');

async function checkDatabase() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('online_booking_system');
    
    const counts = {};
    for (const collection of ['users', 'flights', 'trains', 'hotels', 'bookings', 'admins']) {
      counts[collection] = await db.collection(collection).countDocuments();
    }
    
    console.log('📊 Current Database Contents:');
    Object.entries(counts).forEach(([name, count]) => 
      console.log(`   ${name}: ${count} records`)
    );
    
    await client.close();
  } catch (error) {
    console.error('Error checking database:', error.message);
  }
}

checkDatabase();