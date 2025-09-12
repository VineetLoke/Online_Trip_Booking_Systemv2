/**
 * Unified Data Management Script for Online Booking System
 * 
 * This script combines all data management functionality:
 * - Database setup and initialization
 * - Data generation (flights, trains, hotels, bookings)
 * - Database clearing and reset
 * - Environment configuration
 * 
 * Usage:
 * node data_manager.js --action=setup
 * node data_manager.js --action=clear
 * node data_manager.js --action=generate --type=all --days=30
 * node data_manager.js --action=add-sample
 */

const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Configuration
const DEFAULT_URI = 'mongodb://localhost:27017';
const DB_NAME = 'online_booking_system';
const BATCH_SIZE = 1000; // For large data insertions

// Import models for validation
const User = require('./models/User');
const Flight = require('./models/Flight');
const Train = require('./models/Train');
const Hotel = require('./models/Hotel');
const Booking = require('./models/Booking');
const Admin = require('./models/Admin');

// Data templates
const FLIGHT_TEMPLATES = [
  { airline: "Air India", flightNumber: "AI", aircraft: "Boeing 737", basePrice: 4500 },
  { airline: "IndiGo", flightNumber: "6E", aircraft: "Airbus A320", basePrice: 3800 },
  { airline: "SpiceJet", flightNumber: "SG", aircraft: "Boeing 737", basePrice: 4200 },
  { airline: "Vistara", flightNumber: "UK", aircraft: "Airbus A320", basePrice: 5000 },
  { airline: "GoAir", flightNumber: "G8", aircraft: "Airbus A320", basePrice: 3600 }
];

const TRAIN_TEMPLATES = [
  { trainName: "Rajdhani Express", trainNumber: "12345", class: "AC 2-Tier", basePrice: 2500 },
  { trainName: "Shatabdi Express", trainNumber: "12346", class: "AC Chair Car", basePrice: 1800 },
  { trainName: "Karnataka Express", trainNumber: "12627", class: "AC 3-Tier", basePrice: 2000 },
  { trainName: "Tamil Nadu Express", trainNumber: "12628", class: "AC 3-Tier", basePrice: 2200 },
  { trainName: "Goa Express", trainNumber: "12779", class: "AC 2-Tier", basePrice: 2400 }
];

const HOTEL_TEMPLATES = [
  { name: "Grand Hotel", location: "Mumbai", basePrice: 3500, roomType: "Deluxe", amenities: ["WiFi", "Pool", "Gym", "Restaurant"] },
  { name: "Palace Hotel", location: "Delhi", basePrice: 4200, roomType: "Suite", amenities: ["WiFi", "Spa", "Restaurant", "Bar"] },
  { name: "Beach Resort", location: "Goa", basePrice: 5500, roomType: "Ocean View", amenities: ["WiFi", "Beach Access", "Pool", "Water Sports"] },
  { name: "Garden Hotel", location: "Bangalore", basePrice: 3800, roomType: "Executive", amenities: ["WiFi", "Garden", "Restaurant", "Business Center"] },
  { name: "City Center", location: "Chennai", basePrice: 3200, roomType: "Standard", amenities: ["WiFi", "Restaurant", "Room Service"] }
];

const ROUTES = [
  { source: "Delhi", destination: "Mumbai", duration: 2.5 },
  { source: "Mumbai", destination: "Bangalore", duration: 1.5 },
  { source: "Delhi", destination: "Goa", duration: 2.5 },
  { source: "Bangalore", destination: "Chennai", duration: 1.0 },
  { source: "Mumbai", destination: "Delhi", duration: 2.5 },
  { source: "Delhi", destination: "Chennai", duration: 3.0 },
  { source: "Goa", destination: "Mumbai", duration: 1.5 },
  { source: "Chennai", destination: "Bangalore", duration: 1.0 }
];

class DataManager {
  constructor() {
    this.client = null;
    this.db = null;
    this.mongooseConnection = null;
    this.uri = process.env.MONGODB_URI || DEFAULT_URI;
  }

  async connect() {
    try {
      // Connect with native MongoDB driver
      this.client = new MongoClient(this.uri);
      await this.client.connect();
      this.db = this.client.db(DB_NAME);
      console.log('✅ Connected to MongoDB (Native Driver)');

      // Also connect with Mongoose for model validation
      this.mongooseConnection = await mongoose.connect(this.uri + '/' + DB_NAME);
      console.log('✅ Connected to MongoDB (Mongoose)');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.client) {
        await this.client.close();
      }
      if (this.mongooseConnection) {
        await mongoose.disconnect();
      }
      console.log('✅ Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting:', error.message);
    }
  }

  async clearDatabase(confirm = false) {
    if (!confirm) {
      const confirmed = await this.askConfirmation('⚠️  This will delete ALL data. Are you sure? (yes/no)');
      if (!confirmed) {
        console.log('❌ Operation cancelled');
        return;
      }
    }

    console.log('🗑️  Clearing database...');
    const collections = ['users', 'flights', 'trains', 'hotels', 'bookings', 'admins'];
    
    for (const collectionName of collections) {
      try {
        const result = await this.db.collection(collectionName).deleteMany({});
        console.log(`   Cleared ${result.deletedCount} documents from ${collectionName}`);
      } catch (error) {
        console.log(`   Collection ${collectionName} not found or already empty`);
      }
    }
    
    console.log('✅ Database cleared successfully');
  }

  async setupDatabase() {
    console.log('🔧 Setting up database...');
    
    // Create collections
    const collections = ['users', 'flights', 'trains', 'hotels', 'bookings', 'admins'];
    
    for (const collectionName of collections) {
      try {
        await this.db.createCollection(collectionName);
        console.log(`   Created collection: ${collectionName}`);
      } catch (error) {
        if (error.code === 48) {
          console.log(`   Collection ${collectionName} already exists`);
        } else {
          throw error;
        }
      }
    }

    // Create indexes
    await this.createIndexes();
    
    // Insert initial data
    await this.insertInitialData();
    
    console.log('✅ Database setup completed');
  }

  async createIndexes() {
    console.log('📊 Creating indexes...');
    
    const indexes = [
      { collection: 'users', index: { email: 1 }, options: { unique: true } },
      { collection: 'flights', index: { source: 1, destination: 1, departureTime: 1 } },
      { collection: 'flights', index: { flightNumber: 1 }, options: { unique: true } },
      { collection: 'trains', index: { source: 1, destination: 1, departureTime: 1 } },
      { collection: 'trains', index: { trainNumber: 1 }, options: { unique: true } },
      { collection: 'hotels', index: { location: 1 } },
      { collection: 'hotels', index: { name: 1, location: 1 } },
      { collection: 'bookings', index: { userId: 1 } },
      { collection: 'bookings', index: { status: 1 } },
      { collection: 'bookings', index: { bookingDate: 1 } },
      { collection: 'admins', index: { username: 1 }, options: { unique: true } },
      { collection: 'admins', index: { email: 1 }, options: { unique: true } }
    ];

    for (const { collection, index, options = {} } of indexes) {
      try {
        await this.db.collection(collection).createIndex(index, options);
        console.log(`   Created index on ${collection}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`   Index on ${collection} already exists`);
        } else {
          console.log(`   Warning: Could not create index on ${collection}: ${error.message}`);
        }
      }
    }
  }

  async insertInitialData() {
    console.log('📝 Inserting initial data...');
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = {
      name: "System Administrator",
      username: "admin",
      email: "admin@travelease.com",
      passwordHash: hashedPassword,
      role: "super_admin",
      permissions: ["manage_users", "manage_flights", "manage_trains", "manage_hotels", "view_reports"],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.db.collection('admins').deleteMany({ $or: [{ email: admin.email }, { username: admin.username }] });
    await this.db.collection('admins').insertOne(admin);
    console.log('   Created admin user (admin@travelease.com / admin123)');
  }

  async generateData(type = 'all', days = 30) {
    console.log(`🎲 Generating ${type} data for ${days} days...`);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Start from tomorrow
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days - 1);

    if (type === 'all' || type === 'flights') {
      await this.generateFlights(startDate, endDate);
    }
    
    if (type === 'all' || type === 'trains') {
      await this.generateTrains(startDate, endDate);
    }
    
    if (type === 'all' || type === 'hotels') {
      await this.generateHotels();
    }
    
    console.log('✅ Data generation completed');
  }

  async generateFlights(startDate, endDate) {
    console.log('✈️  Generating flights...');
    const flights = [];
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const currentDate = new Date(date);
      
      // Generate 2-4 flights per day
      const numFlights = 2 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numFlights; i++) {
        const template = FLIGHT_TEMPLATES[Math.floor(Math.random() * FLIGHT_TEMPLATES.length)];
        const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];
        
        const departureTime = new Date(currentDate);
        departureTime.setHours(6 + i * 4 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
        
        const arrivalTime = new Date(departureTime);
        arrivalTime.setHours(arrivalTime.getHours() + route.duration + Math.floor(Math.random() * 2));
        
        const price = template.basePrice + Math.floor(Math.random() * 2000);
        const totalSeats = 120 + Math.floor(Math.random() * 80);
        const availableSeats = Math.floor(totalSeats * (0.6 + Math.random() * 0.3));
        
        flights.push({
          flightNumber: `${template.flightNumber}${String(Math.floor(Math.random() * 900) + 100)}`,
          airline: template.airline,
          source: route.source,
          destination: route.destination,
          departureTime: departureTime,
          arrivalTime: arrivalTime,
          price: price,
          availableSeats: availableSeats,
          totalSeats: totalSeats,
          aircraft: template.aircraft,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    
    await this.insertInBatches('flights', flights);
    console.log(`   Generated ${flights.length} flights`);
  }

  async generateTrains(startDate, endDate) {
    console.log('🚂 Generating trains...');
    const trains = [];
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const currentDate = new Date(date);
      
      // Generate 1-3 trains per day
      const numTrains = 1 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numTrains; i++) {
        const template = TRAIN_TEMPLATES[Math.floor(Math.random() * TRAIN_TEMPLATES.length)];
        const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];
        
        const departureTime = new Date(currentDate);
        departureTime.setHours(14 + i * 4 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
        
        const arrivalTime = new Date(departureTime);
        arrivalTime.setHours(arrivalTime.getHours() + route.duration * 2 + Math.floor(Math.random() * 8));
        
        const price = template.basePrice + Math.floor(Math.random() * 1000);
        const totalSeats = 200 + Math.floor(Math.random() * 100);
        const availableSeats = Math.floor(totalSeats * (0.5 + Math.random() * 0.4));
        
        trains.push({
          trainNumber: `${template.trainNumber}${String(Math.floor(Math.random() * 10))}`,
          trainName: template.trainName,
          source: route.source,
          destination: route.destination,
          departureTime: departureTime,
          arrivalTime: arrivalTime,
          price: price,
          availableSeats: availableSeats,
          totalSeats: totalSeats,
          class: template.class,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    
    await this.insertInBatches('trains', trains);
    console.log(`   Generated ${trains.length} trains`);
  }

  async generateHotels() {
    console.log('🏨 Generating hotels...');
    const hotels = [];
    
    // Generate hotels for each location
    const locations = [...new Set(ROUTES.flatMap(r => [r.source, r.destination]))];
    
    for (const location of locations) {
      const numHotels = 2 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numHotels; i++) {
        const template = HOTEL_TEMPLATES[Math.floor(Math.random() * HOTEL_TEMPLATES.length)];
        const price = template.basePrice + Math.floor(Math.random() * 2000);
        const totalRooms = 30 + Math.floor(Math.random() * 40);
        const availableRooms = Math.floor(totalRooms * (0.4 + Math.random() * 0.5));
        
        hotels.push({
          name: `${template.name} ${location}`,
          location: location,
          address: `${Math.floor(Math.random() * 999) + 1} ${location} Street, ${location}`,
          price: price,
          rating: 4.0 + Math.random() * 1.0,
          amenities: template.amenities,
          availableRooms: availableRooms,
          totalRooms: totalRooms,
          roomType: template.roomType,
          images: [`hotel${i + 1}.jpg`],
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    
    await this.insertInBatches('hotels', hotels);
    console.log(`   Generated ${hotels.length} hotels`);
  }

  async generateSampleBookings(count = 50) {
    console.log(`📋 Generating ${count} sample bookings...`);
    
    // Get existing data
    const users = await this.db.collection('users').find().limit(5).toArray();
    const flights = await this.db.collection('flights').find().limit(10).toArray();
    const trains = await this.db.collection('trains').find().limit(10).toArray();
    const hotels = await this.db.collection('hotels').find().limit(10).toArray();

    if (users.length === 0) {
      console.log('⚠️  No users found. Creating sample users first...');
      await this.createSampleUsers();
      const newUsers = await this.db.collection('users').find().limit(5).toArray();
      users.push(...newUsers);
    }

    if (flights.length === 0 || trains.length === 0 || hotels.length === 0) {
      console.log('⚠️  Insufficient data. Please run data generation first.');
      return;
    }

    const bookings = [];
    const statuses = ['confirmed', 'pending', 'cancelled'];
    const bookingTypes = ['flight', 'train', 'hotel'];

    for (let i = 0; i < count; i++) {
      const bookingType = bookingTypes[Math.floor(Math.random() * bookingTypes.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() - Math.floor(Math.random() * 180));

      let trip, totalAmount;

      switch (bookingType) {
        case 'flight':
          const flight = flights[Math.floor(Math.random() * flights.length)];
          trip = {
            type: 'flight',
            destination: flight.destination,
            startDate: flight.departureTime,
            endDate: flight.arrivalTime,
            flightDetails: {
              flightId: flight._id,
              flightNumber: flight.flightNumber,
              airline: flight.airline,
              source: flight.source,
              destination: flight.destination,
              departureTime: flight.departureTime,
              arrivalTime: flight.arrivalTime,
              passengerDetails: {
                name: user.name,
                age: 30,
                gender: 'Male'
              }
            }
          };
          totalAmount = flight.price + Math.floor(Math.random() * 1000);
          break;

        case 'train':
          const train = trains[Math.floor(Math.random() * trains.length)];
          trip = {
            type: 'train',
            destination: train.destination,
            startDate: train.departureTime,
            endDate: train.arrivalTime,
            trainDetails: {
              trainId: train._id,
              trainNumber: train.trainNumber,
              trainName: train.trainName,
              source: train.source,
              destination: train.destination,
              departureTime: train.departureTime,
              arrivalTime: train.arrivalTime,
              class: train.class,
              passengerDetails: {
                name: user.name,
                age: 30,
                gender: 'Male'
              }
            }
          };
          totalAmount = train.price + Math.floor(Math.random() * 500);
          break;

        case 'hotel':
          const hotel = hotels[Math.floor(Math.random() * hotels.length)];
          const checkIn = new Date(bookingDate);
          checkIn.setDate(checkIn.getDate() + Math.floor(Math.random() * 30));
          const checkOut = new Date(checkIn);
          checkOut.setDate(checkOut.getDate() + Math.floor(Math.random() * 5) + 1);
          const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
          
          trip = {
            type: 'hotel',
            destination: hotel.location,
            startDate: checkIn,
            endDate: checkOut,
            hotelDetails: {
              hotelId: hotel._id,
              name: hotel.name,
              location: hotel.location,
              checkInDate: checkIn,
              checkOutDate: checkOut,
              nights: nights,
              roomType: hotel.roomType,
              guestDetails: {
                primaryGuest: user.name,
                numberOfGuests: Math.floor(Math.random() * 3) + 1
              }
            }
          };
          totalAmount = hotel.price * nights;
          break;
      }

      bookings.push({
        userId: user._id,
        bookingType: bookingType,
        trip: trip,
        totalAmount: totalAmount,
        status: status,
        bookingDate: bookingDate,
        paymentStatus: status === 'confirmed' ? 'completed' : status === 'pending' ? 'pending' : 'failed',
        createdAt: bookingDate,
        updatedAt: bookingDate
      });
    }

    await this.insertInBatches('bookings', bookings);
    console.log(`   Generated ${bookings.length} sample bookings`);
  }

  async createSampleUsers() {
    console.log('👥 Creating sample users...');
    const users = [];
    
    const sampleUsers = [
      { name: "John Doe", email: "john@example.com", phone: "1234567890", password: "password123" },
      { name: "Jane Smith", email: "jane@example.com", phone: "0987654321", password: "password123" },
      { name: "Bob Johnson", email: "bob@example.com", phone: "1122334455", password: "password123" },
      { name: "Alice Brown", email: "alice@example.com", phone: "5566778899", password: "password123" },
      { name: "Charlie Wilson", email: "charlie@example.com", phone: "9988776655", password: "password123" }
    ];

    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      users.push({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        passwordHash: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await this.insertInBatches('users', users);
    console.log(`   Created ${users.length} sample users`);
  }

  async insertInBatches(collection, data) {
    if (data.length === 0) return;
    
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      await this.db.collection(collection).insertMany(batch);
    }
  }

  async askConfirmation(question) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(question + ' ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
      });
    });
  }

  async showStats() {
    console.log('📊 Database Statistics:');
    
    const collections = ['users', 'flights', 'trains', 'hotels', 'bookings', 'admins'];
    
    for (const collection of collections) {
      try {
        const count = await this.db.collection(collection).countDocuments();
        console.log(`   ${collection}: ${count} documents`);
      } catch (error) {
        console.log(`   ${collection}: 0 documents (collection not found)`);
      }
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const action = args.find(arg => arg.startsWith('--action='))?.split('=')[1] || 'help';
  const type = args.find(arg => arg.startsWith('--type='))?.split('=')[1] || 'all';
  const days = parseInt(args.find(arg => arg.startsWith('--days='))?.split('=')[1]) || 30;
  const count = parseInt(args.find(arg => arg.startsWith('--count='))?.split('=')[1]) || 50;

  const dataManager = new DataManager();

  try {
    await dataManager.connect();

    switch (action) {
      case 'setup':
        await dataManager.setupDatabase();
        await dataManager.generateData('all', 7); // Generate 1 week of data
        await dataManager.createSampleUsers();
        await dataManager.generateSampleBookings(20);
        break;

      case 'clear':
        await dataManager.clearDatabase();
        break;

      case 'generate':
        await dataManager.generateData(type, days);
        break;

      case 'add-sample':
        await dataManager.createSampleUsers();
        await dataManager.generateSampleBookings(count);
        break;

      case 'stats':
        await dataManager.showStats();
        break;

      case 'help':
      default:
        console.log(`
🎯 Online Booking System - Data Manager

Usage: node data_manager.js --action=<action> [options]

Actions:
  setup     - Complete database setup (collections, indexes, initial data)
  clear     - Clear all data from database
  generate  - Generate flights, trains, and hotels
  add-sample- Add sample users and bookings
  stats     - Show database statistics
  help      - Show this help message

Options:
  --type=<type>    - Data type to generate (all, flights, trains, hotels)
  --days=<number>  - Number of days to generate data for (default: 30)
  --count=<number> - Number of sample bookings to create (default: 50)

Examples:
  node data_manager.js --action=setup
  node data_manager.js --action=generate --type=flights --days=7
  node data_manager.js --action=add-sample --count=100
  node data_manager.js --action=stats
        `);
        break;
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await dataManager.disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = DataManager;
