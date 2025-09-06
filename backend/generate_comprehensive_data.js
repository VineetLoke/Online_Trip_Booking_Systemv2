// Comprehensive Data Generator for Online Booking System
// This script generates flights, trains, and hotels for every day from tomorrow until Dec 2025

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'online_booking_system';

// Sample data templates
const flightTemplates = [
  { airline: "Air India", flightNumber: "AI", aircraft: "Boeing 737", basePrice: 4500 },
  { airline: "IndiGo", flightNumber: "6E", aircraft: "Airbus A320", basePrice: 3800 },
  { airline: "SpiceJet", flightNumber: "SG", aircraft: "Boeing 737", basePrice: 4200 },
  { airline: "Vistara", flightNumber: "UK", aircraft: "Airbus A320", basePrice: 5000 },
  { airline: "GoAir", flightNumber: "G8", aircraft: "Airbus A320", basePrice: 3600 }
];

const trainTemplates = [
  { trainName: "Rajdhani Express", trainNumber: "12345", class: "AC 2-Tier", basePrice: 2500 },
  { trainName: "Shatabdi Express", trainNumber: "12346", class: "AC Chair Car", basePrice: 1800 },
  { trainName: "Karnataka Express", trainNumber: "12627", class: "AC 3-Tier", basePrice: 2000 },
  { trainName: "Tamil Nadu Express", trainNumber: "12628", class: "AC 3-Tier", basePrice: 2200 },
  { trainName: "Goa Express", trainNumber: "12779", class: "AC 2-Tier", basePrice: 2400 }
];

const hotelTemplates = [
  { name: "Grand Hotel", location: "Mumbai", basePrice: 3500, roomType: "Deluxe" },
  { name: "Palace Hotel", location: "Delhi", basePrice: 4200, roomType: "Suite" },
  { name: "Beach Resort", location: "Goa", basePrice: 5500, roomType: "Ocean View" },
  { name: "Garden Hotel", location: "Bangalore", basePrice: 3800, roomType: "Executive" },
  { name: "City Center", location: "Chennai", basePrice: 3200, roomType: "Standard" }
];

const routes = [
  { source: "Delhi", destination: "Mumbai", duration: 2.5 },
  { source: "Mumbai", destination: "Bangalore", duration: 1.5 },
  { source: "Delhi", destination: "Goa", duration: 2.5 },
  { source: "Bangalore", destination: "Chennai", duration: 1.0 },
  { source: "Mumbai", destination: "Delhi", duration: 2.5 },
  { source: "Delhi", destination: "Chennai", duration: 3.0 },
  { source: "Goa", destination: "Mumbai", duration: 1.5 },
  { source: "Chennai", destination: "Bangalore", duration: 1.0 }
];

async function generateComprehensiveData() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Clear existing data
    console.log('Clearing existing data...');
    await db.collection('flights').deleteMany({});
    await db.collection('trains').deleteMany({});
    await db.collection('hotels').deleteMany({});
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Start from tomorrow
    const endDate = new Date('2025-12-31');
    
    console.log(`Generating data from ${startDate.toDateString()} to ${endDate.toDateString()}`);
    
    const flights = [];
    const trains = [];
    const hotels = [];
    
    // Generate data for each day
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const currentDate = new Date(date);
      
      // Generate 3-5 flights per day
      const numFlights = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numFlights; i++) {
        const template = flightTemplates[Math.floor(Math.random() * flightTemplates.length)];
        const route = routes[Math.floor(Math.random() * routes.length)];
        
        const departureTime = new Date(currentDate);
        departureTime.setHours(6 + i * 3 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
        
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
      
      // Generate 2-3 trains per day
      const numTrains = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numTrains; i++) {
        const template = trainTemplates[Math.floor(Math.random() * trainTemplates.length)];
        const route = routes[Math.floor(Math.random() * routes.length)];
        
        const departureTime = new Date(currentDate);
        departureTime.setHours(16 + i * 4 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
        
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
      
      // Generate 2-4 hotels per day (hotels are available every day)
      const numHotels = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numHotels; i++) {
        const template = hotelTemplates[Math.floor(Math.random() * hotelTemplates.length)];
        
        const price = template.basePrice + Math.floor(Math.random() * 2000);
        const totalRooms = 30 + Math.floor(Math.random() * 40);
        const availableRooms = Math.floor(totalRooms * (0.4 + Math.random() * 0.5));
        
        hotels.push({
          name: `${template.name} ${currentDate.getFullYear()}`,
          location: template.location,
          address: `${Math.floor(Math.random() * 999) + 1} ${template.location} Street, ${template.location}`,
          price: price,
          rating: 4.0 + Math.random() * 1.0,
          amenities: ["WiFi", "Pool", "Restaurant", "Room Service", "Gym"],
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
    
    // Insert data in batches
    console.log(`Inserting ${flights.length} flights...`);
    if (flights.length > 0) {
      await db.collection('flights').insertMany(flights);
    }
    
    console.log(`Inserting ${trains.length} trains...`);
    if (trains.length > 0) {
      await db.collection('trains').insertMany(trains);
    }
    
    console.log(`Inserting ${hotels.length} hotels...`);
    if (hotels.length > 0) {
      await db.collection('hotels').insertMany(hotels);
    }
    
    console.log('Comprehensive data generation completed successfully!');
    console.log(`Generated ${flights.length} flights, ${trains.length} trains, and ${hotels.length} hotels`);
    console.log('Data is available for every day from tomorrow until December 31, 2025');
    
  } catch (error) {
    console.error('Error generating comprehensive data:', error);
  } finally {
    await client.close();
  }
}

// Run the script
generateComprehensiveData();
