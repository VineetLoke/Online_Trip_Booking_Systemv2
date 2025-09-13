// Quick Fix Data Generator - Solves the bidirectional route problem
// This generates essential routes with return trips to fix the search issue

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'online_booking_system';

// Essential routes with return trips
const ESSENTIAL_ROUTES = [
  // Delhi routes
  { source: "Delhi", destination: "Mumbai", duration: 2.5 },
  { source: "Mumbai", destination: "Delhi", duration: 2.5 },
  { source: "Delhi", destination: "Bangalore", duration: 3.0 },
  { source: "Bangalore", destination: "Delhi", duration: 3.0 },
  { source: "Delhi", destination: "Chennai", duration: 3.5 },
  { source: "Chennai", destination: "Delhi", duration: 3.5 },
  { source: "Delhi", destination: "Kolkata", duration: 2.0 },
  { source: "Kolkata", destination: "Delhi", duration: 2.0 },
  { source: "Delhi", destination: "Hyderabad", duration: 2.5 },
  { source: "Hyderabad", destination: "Delhi", duration: 2.5 },
  { source: "Delhi", destination: "Goa", duration: 2.5 },
  { source: "Goa", destination: "Delhi", duration: 2.5 },
  { source: "Delhi", destination: "Jaipur", duration: 1.0 },
  { source: "Jaipur", destination: "Delhi", duration: 1.0 },
  
  // Mumbai routes
  { source: "Mumbai", destination: "Bangalore", duration: 1.5 },
  { source: "Bangalore", destination: "Mumbai", duration: 1.5 },
  { source: "Mumbai", destination: "Chennai", duration: 2.0 },
  { source: "Chennai", destination: "Mumbai", duration: 2.0 },
  { source: "Mumbai", destination: "Goa", duration: 1.0 },
  { source: "Goa", destination: "Mumbai", duration: 1.0 },
  { source: "Mumbai", destination: "Pune", duration: 0.5 },
  { source: "Pune", destination: "Mumbai", duration: 0.5 },
  { source: "Mumbai", destination: "Ahmedabad", duration: 1.0 },
  { source: "Ahmedabad", destination: "Mumbai", duration: 1.0 },
  
  // Bangalore routes
  { source: "Bangalore", destination: "Chennai", duration: 1.0 },
  { source: "Chennai", destination: "Bangalore", duration: 1.0 },
  { source: "Bangalore", destination: "Hyderabad", duration: 1.5 },
  { source: "Hyderabad", destination: "Bangalore", duration: 1.5 },
  { source: "Bangalore", destination: "Kochi", duration: 1.5 },
  { source: "Kochi", destination: "Bangalore", duration: 1.5 },
  { source: "Bangalore", destination: "Mysore", duration: 0.5 },
  { source: "Mysore", destination: "Bangalore", duration: 0.5 },
  
  // Chennai routes
  { source: "Chennai", destination: "Hyderabad", duration: 1.5 },
  { source: "Hyderabad", destination: "Chennai", duration: 1.5 },
  { source: "Chennai", destination: "Kochi", duration: 1.5 },
  { source: "Kochi", destination: "Chennai", duration: 1.5 },
  { source: "Chennai", destination: "Trivandrum", duration: 1.5 },
  { source: "Trivandrum", destination: "Chennai", duration: 1.5 },
  
  // Kolkata routes
  { source: "Kolkata", destination: "Hyderabad", duration: 2.5 },
  { source: "Hyderabad", destination: "Kolkata", duration: 2.5 },
  { source: "Kolkata", destination: "Bhubaneswar", duration: 1.0 },
  { source: "Bhubaneswar", destination: "Kolkata", duration: 1.0 },
  { source: "Kolkata", destination: "Patna", duration: 1.5 },
  { source: "Patna", destination: "Kolkata", duration: 1.5 },
  
  // Hyderabad routes
  { source: "Hyderabad", destination: "Goa", duration: 2.0 },
  { source: "Goa", destination: "Hyderabad", duration: 2.0 },
  { source: "Hyderabad", destination: "Kochi", duration: 2.0 },
  { source: "Kochi", destination: "Hyderabad", duration: 2.0 },
  
  // Goa routes
  { source: "Goa", destination: "Kochi", duration: 1.5 },
  { source: "Kochi", destination: "Goa", duration: 1.5 },
  { source: "Goa", destination: "Mysore", duration: 1.5 },
  { source: "Mysore", destination: "Goa", duration: 1.5 }
];

// Flight templates
const FLIGHT_TEMPLATES = [
  { airline: "Air India", flightNumber: "AI", aircraft: "Boeing 737", basePrice: 4500 },
  { airline: "IndiGo", flightNumber: "6E", aircraft: "Airbus A320", basePrice: 3800 },
  { airline: "SpiceJet", flightNumber: "SG", aircraft: "Boeing 737", basePrice: 4200 },
  { airline: "Vistara", flightNumber: "UK", aircraft: "Airbus A320", basePrice: 5000 },
  { airline: "GoAir", flightNumber: "G8", aircraft: "Airbus A320", basePrice: 3600 }
];

// Train templates
const TRAIN_TEMPLATES = [
  { trainName: "Rajdhani Express", trainNumber: "12345", class: "AC 2-Tier", basePrice: 2500 },
  { trainName: "Shatabdi Express", trainNumber: "12346", class: "AC Chair Car", basePrice: 1800 },
  { trainName: "Karnataka Express", trainNumber: "12627", class: "AC 3-Tier", basePrice: 2000 },
  { trainName: "Tamil Nadu Express", trainNumber: "12628", class: "AC 3-Tier", basePrice: 2200 },
  { trainName: "Goa Express", trainNumber: "12779", class: "AC 2-Tier", basePrice: 2400 }
];

// Hotel templates
const HOTEL_TEMPLATES = [
  { name: "Grand Hotel", basePrice: 3500, roomType: "Deluxe", amenities: ["WiFi", "Pool", "Gym", "Restaurant"] },
  { name: "Palace Hotel", basePrice: 4200, roomType: "Suite", amenities: ["WiFi", "Spa", "Restaurant", "Bar"] },
  { name: "Beach Resort", basePrice: 5500, roomType: "Ocean View", amenities: ["WiFi", "Beach Access", "Pool", "Water Sports"] },
  { name: "Garden Hotel", basePrice: 3800, roomType: "Executive", amenities: ["WiFi", "Garden", "Restaurant", "Business Center"] },
  { name: "City Center", basePrice: 3200, roomType: "Standard", amenities: ["WiFi", "Restaurant", "Room Service"] }
];

async function generateQuickFixData() {
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
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // Generate for next 30 days
    
    console.log(`Generating data from ${startDate.toDateString()} to ${endDate.toDateString()}`);
    
    const flights = [];
    const trains = [];
    const hotels = [];
    
    // Generate data for each day
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const currentDate = new Date(date);
      
      // Generate flights for each route
      for (const route of ESSENTIAL_ROUTES) {
        const template = FLIGHT_TEMPLATES[Math.floor(Math.random() * FLIGHT_TEMPLATES.length)];
        const flightNumber = `${template.flightNumber}${String(Math.floor(Math.random() * 900) + 100)}`;
        
        const departureTime = new Date(currentDate);
        departureTime.setHours(6 + Math.floor(Math.random() * 16), Math.floor(Math.random() * 60), 0, 0);
        
        const arrivalTime = new Date(departureTime);
        arrivalTime.setHours(arrivalTime.getHours() + route.duration + Math.floor(Math.random() * 2));
        
        const price = template.basePrice + Math.floor(Math.random() * 2000);
        const totalSeats = 120 + Math.floor(Math.random() * 80);
        const availableSeats = Math.floor(totalSeats * (0.6 + Math.random() * 0.3));
        
        flights.push({
          flightNumber: flightNumber,
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
      
      // Generate trains for each route (less frequent)
      for (const route of ESSENTIAL_ROUTES) {
        if (Math.random() > 0.5) continue; // Only 50% of routes get trains
        
        const template = TRAIN_TEMPLATES[Math.floor(Math.random() * TRAIN_TEMPLATES.length)];
        const trainNumber = `${template.trainNumber}${String(Math.floor(Math.random() * 90) + 10)}`;
        
        const departureTime = new Date(currentDate);
        departureTime.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);
        
        const arrivalTime = new Date(departureTime);
        arrivalTime.setHours(arrivalTime.getHours() + route.duration * 2 + Math.floor(Math.random() * 4));
        
        const price = template.basePrice + Math.floor(Math.random() * 1000);
        const totalSeats = 300 + Math.floor(Math.random() * 200);
        const availableSeats = Math.floor(totalSeats * (0.7 + Math.random() * 0.2));
        
        trains.push({
          trainNumber: trainNumber,
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
    
    // Generate hotels for each destination
    const allDestinations = [...new Set(ESSENTIAL_ROUTES.flatMap(r => [r.source, r.destination]))];
    for (const destination of allDestinations) {
      // Generate 2-3 hotels per destination
      const numHotels = 2 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < numHotels; i++) {
        const template = HOTEL_TEMPLATES[Math.floor(Math.random() * HOTEL_TEMPLATES.length)];
        
        const price = template.basePrice + Math.floor(Math.random() * 2000);
        const totalRooms = 50 + Math.floor(Math.random() * 100);
        const availableRooms = Math.floor(totalRooms * (0.6 + Math.random() * 0.3));
        
        hotels.push({
          name: `${template.name} ${destination}`,
          location: destination,
          address: `${Math.floor(Math.random() * 999) + 1} Main Street, ${destination}`,
          rating: 3.5 + Math.random() * 1.5,
          price: price,
          roomType: template.roomType,
          amenities: template.amenities,
          availableRooms: availableRooms,
          totalRooms: totalRooms,
          images: [`hotel_${destination.toLowerCase()}_${i + 1}.jpg`],
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    
    // Insert data
    console.log('Inserting flights...');
    if (flights.length > 0) {
      await db.collection('flights').insertMany(flights);
      console.log(`Inserted ${flights.length} flights`);
    }
    
    console.log('Inserting trains...');
    if (trains.length > 0) {
      await db.collection('trains').insertMany(trains);
      console.log(`Inserted ${trains.length} trains`);
    }
    
    console.log('Inserting hotels...');
    if (hotels.length > 0) {
      await db.collection('hotels').insertMany(hotels);
      console.log(`Inserted ${hotels.length} hotels`);
    }
    
    console.log('✅ Quick fix data generation completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Routes: ${ESSENTIAL_ROUTES.length} (all bidirectional)`);
    console.log(`   - Flights: ${flights.length}`);
    console.log(`   - Trains: ${trains.length}`);
    console.log(`   - Hotels: ${hotels.length}`);
    console.log(`   - Destinations: ${allDestinations.length}`);
    console.log('');
    console.log('🎯 Problem solved:');
    console.log('   - Delhi to Mumbai → Will show flights/trains');
    console.log('   - Mumbai to Delhi → Will show return flights/trains');
    console.log('   - All routes are bidirectional!');
    
  } catch (error) {
    console.error('❌ Error generating data:', error);
  } finally {
    await client.close();
  }
}

// Run the generator
if (require.main === module) {
  generateQuickFixData();
}

module.exports = { generateQuickFixData };
