// Database Setup Script for Online Booking System
// This script creates the database, collections, and inserts sample data

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'online_booking_system';

async function setupDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Create collections
    const collections = ['users', 'flights', 'trains', 'hotels', 'bookings', 'admins'];
    
    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`Created collection: ${collectionName}`);
      } catch (error) {
        if (error.code === 48) {
          console.log(`Collection ${collectionName} already exists`);
        } else {
          throw error;
        }
      }
    }
    
    // Insert sample data
    await insertSampleData(db);
    
    // Create indexes
    await createIndexes(db);
    
    console.log('Database setup completed successfully!');
    
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await client.close();
  }
}

async function insertSampleData(db) {
  console.log('Inserting sample data...');
  
  // Sample Users
  const users = [
    {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      passwordHash: "$2b$10$rOOjXdL0XqKqJZ9.WvKuVeKX8YrJ9YrJ9YrJ9YrJ9YrJ9YrJ9YrJ9Y", // password: "password123"
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+1234567891",
      passwordHash: "$2b$10$rOOjXdL0XqKqJZ9.WvKuVeKX8YrJ9YrJ9YrJ9YrJ9YrJ9YrJ9YrJ9Y",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  await db.collection('users').insertMany(users);
  console.log('Inserted sample users');
  
  // Sample Flights
  const flights = [
    {
      flightNumber: "AI101",
      airline: "Air India",
      source: "Delhi",
      destination: "Mumbai",
      departureTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      arrivalTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      price: 5500,
      availableSeats: 150,
      totalSeats: 180,
      aircraft: "Boeing 737",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      flightNumber: "6E202",
      airline: "IndiGo",
      source: "Mumbai",
      destination: "Bangalore",
      departureTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      arrivalTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000), // 1.5 hours later
      price: 4200,
      availableSeats: 120,
      totalSeats: 150,
      aircraft: "Airbus A320",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      flightNumber: "SG303",
      airline: "SpiceJet",
      source: "Delhi",
      destination: "Goa",
      departureTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      arrivalTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000), // 2.5 hours later
      price: 6800,
      availableSeats: 80,
      totalSeats: 100,
      aircraft: "Boeing 737",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  await db.collection('flights').insertMany(flights);
  console.log('Inserted sample flights');
  
  // Sample Trains
  const trains = [
    {
      trainNumber: "12345",
      trainName: "Rajdhani Express",
      source: "Delhi",
      destination: "Mumbai",
      departureTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // 2 days from now at 4:30 PM
      arrivalTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // Next day at 8:30 AM
      price: 2500,
      availableSeats: 200,
      totalSeats: 300,
      class: "AC 2-Tier",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      trainNumber: "12627",
      trainName: "Karnataka Express",
      source: "Delhi",
      destination: "Bangalore",
      departureTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000), // 3 days from now at 10:00 PM
      arrivalTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // 2 days later at 5:30 AM
      price: 1800,
      availableSeats: 150,
      totalSeats: 250,
      class: "AC 3-Tier",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      trainNumber: "12779",
      trainName: "Goa Express",
      source: "Delhi",
      destination: "Goa",
      departureTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000 + 20 * 60 * 1000), // 4 days from now at 3:20 PM
      arrivalTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000 + 45 * 60 * 1000), // 2 days later at 7:45 AM
      price: 2200,
      availableSeats: 180,
      totalSeats: 280,
      class: "AC 2-Tier",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  await db.collection('trains').insertMany(trains);
  console.log('Inserted sample trains');
  
  // Sample Hotels
  const hotels = [
    {
      name: "Grand Hotel Mumbai",
      location: "Mumbai",
      address: "123 Marine Drive, Mumbai, Maharashtra",
      price: 3500,
      rating: 4.5,
      amenities: ["WiFi", "Pool", "Gym", "Restaurant", "Room Service"],
      availableRooms: 25,
      totalRooms: 50,
      roomType: "Deluxe",
      images: ["hotel1.jpg", "hotel2.jpg"],
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Bangalore Palace Hotel",
      location: "Bangalore",
      address: "456 MG Road, Bangalore, Karnataka",
      price: 4200,
      rating: 4.8,
      amenities: ["WiFi", "Spa", "Restaurant", "Bar", "Conference Room"],
      availableRooms: 15,
      totalRooms: 30,
      roomType: "Suite",
      images: ["hotel3.jpg", "hotel4.jpg"],
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Goa Beach Resort",
      location: "Goa",
      address: "789 Calangute Beach, Goa",
      price: 5500,
      rating: 4.7,
      amenities: ["WiFi", "Beach Access", "Pool", "Restaurant", "Water Sports"],
      availableRooms: 20,
      totalRooms: 40,
      roomType: "Ocean View",
      images: ["hotel5.jpg", "hotel6.jpg"],
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  await db.collection('hotels').insertMany(hotels);
  console.log('Inserted sample hotels');
  
  // Sample Admin
  const admins = [
    {
      username: "admin",
      email: "admin@bookingsystem.com",
      passwordHash: "$2b$10$rOOjXdL0XqKqJZ9.WvKuVeKX8YrJ9YrJ9YrJ9YrJ9YrJ9YrJ9YrJ9Y", // password: "admin123"
      role: "admin",
      permissions: ["manage_users", "manage_flights", "manage_trains", "manage_hotels", "view_reports"],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  await db.collection('admins').insertMany(admins);
  console.log('Inserted sample admin');
}

async function createIndexes(db) {
  console.log('Creating indexes...');
  
  // Users collection indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  
  // Flights collection indexes
  await db.collection('flights').createIndex({ source: 1, destination: 1, departureTime: 1 });
  await db.collection('flights').createIndex({ flightNumber: 1 }, { unique: true });
  
  // Trains collection indexes
  await db.collection('trains').createIndex({ source: 1, destination: 1, departureTime: 1 });
  await db.collection('trains').createIndex({ trainNumber: 1 }, { unique: true });
  
  // Hotels collection indexes
  await db.collection('hotels').createIndex({ location: 1 });
  await db.collection('hotels').createIndex({ name: 1, location: 1 });
  
  // Bookings collection indexes
  await db.collection('bookings').createIndex({ userId: 1 });
  await db.collection('bookings').createIndex({ status: 1 });
  await db.collection('bookings').createIndex({ bookingDate: 1 });
  
  // Admins collection indexes
  await db.collection('admins').createIndex({ username: 1 }, { unique: true });
  await db.collection('admins').createIndex({ email: 1 }, { unique: true });
  
  console.log('Indexes created successfully');
}

// Run the setup
setupDatabase();

