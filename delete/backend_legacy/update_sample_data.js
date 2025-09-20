// Update Sample Data Script for Online Booking System
// This script updates existing sample data with future dates

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'online_booking_system';

async function updateSampleData() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    console.log('Updating sample data with future dates...');
    
    // Update flights with future dates
    const flights = await db.collection('flights').find({}).toArray();
    console.log(`Found ${flights.length} flights to update`);
    
    for (let i = 0; i < flights.length; i++) {
      const flight = flights[i];
      const daysFromNow = 2 + i; // 2, 3, 4 days from now
      const departureTime = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
      const arrivalTime = new Date(departureTime.getTime() + (2 + i * 0.5) * 60 * 60 * 1000); // 2-3.5 hours later
      
      await db.collection('flights').updateOne(
        { _id: flight._id },
        {
          $set: {
            departureTime: departureTime,
            arrivalTime: arrivalTime,
            updatedAt: new Date()
          }
        }
      );
      console.log(`Updated flight ${flight.flightNumber} - Departure: ${departureTime.toLocaleString()}`);
    }
    
    // Update trains with future dates
    const trains = await db.collection('trains').find({}).toArray();
    console.log(`Found ${trains.length} trains to update`);
    
    for (let i = 0; i < trains.length; i++) {
      const train = trains[i];
      const daysFromNow = 2 + i; // 2, 3, 4 days from now
      const departureTime = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000 + (16 + i * 2) * 60 * 60 * 1000); // 4:30 PM, 6:30 PM, 8:30 PM
      const arrivalTime = new Date(departureTime.getTime() + (16 + i * 4) * 60 * 60 * 1000); // 16-24 hours later
      
      await db.collection('trains').updateOne(
        { _id: train._id },
        {
          $set: {
            departureTime: departureTime,
            arrivalTime: arrivalTime,
            updatedAt: new Date()
          }
        }
      );
      console.log(`Updated train ${train.trainNumber} - Departure: ${departureTime.toLocaleString()}`);
    }
    
    console.log('Sample data updated successfully!');
    console.log('All flights and trains now have future departure times.');
    
  } catch (error) {
    console.error('Error updating sample data:', error);
  } finally {
    await client.close();
  }
}

// Run the update
updateSampleData();
