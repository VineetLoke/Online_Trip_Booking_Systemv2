// Enhanced Comprehensive Data Generator for Online Booking System
// Generates 100+ flights, trains, hotels with variety and bidirectional routes

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = 'mongodb://localhost:27017';
const dbName = 'online_booking_system';

// Enhanced flight templates with more airlines
const flightTemplates = [
  { airline: "Air India", flightNumber: "AI", aircraft: "Boeing 737", basePrice: 4500 },
  { airline: "IndiGo", flightNumber: "6E", aircraft: "Airbus A320", basePrice: 3800 },
  { airline: "SpiceJet", flightNumber: "SG", aircraft: "Boeing 737", basePrice: 4200 },
  { airline: "Vistara", flightNumber: "UK", aircraft: "Airbus A320", basePrice: 5000 },
  { airline: "GoAir", flightNumber: "G8", aircraft: "Airbus A320", basePrice: 3600 },
  { airline: "AirAsia India", flightNumber: "I5", aircraft: "Airbus A320", basePrice: 3400 },
  { airline: "Alliance Air", flightNumber: "9I", aircraft: "ATR 72", basePrice: 3200 },
  { airline: "Jet Airways", flightNumber: "9W", aircraft: "Boeing 737", basePrice: 4800 },
  { airline: "Star Air", flightNumber: "S5", aircraft: "Embraer 145", basePrice: 3300 },
  { airline: "TruJet", flightNumber: "2T", aircraft: "ATR 72", basePrice: 3100 }
];

// Enhanced train templates with more varieties
const trainTemplates = [
  { trainName: "Rajdhani Express", trainNumber: "12301", class: "AC 1st Class", basePrice: 3500 },
  { trainName: "Shatabdi Express", trainNumber: "12002", class: "AC Chair Car", basePrice: 1800 },
  { trainName: "Duronto Express", trainNumber: "12259", class: "AC 2-Tier", basePrice: 2800 },
  { trainName: "Garib Rath", trainNumber: "12910", class: "AC 3-Tier", basePrice: 1500 },
  { trainName: "Jan Shatabdi", trainNumber: "12023", class: "AC Chair Car", basePrice: 1200 },
  { trainName: "Superfast Express", trainNumber: "12625", class: "AC 2-Tier", basePrice: 2200 },
  { trainName: "Mail Express", trainNumber: "11077", class: "AC 3-Tier", basePrice: 1800 },
  { trainName: "Intercity Express", trainNumber: "12049", class: "AC Chair Car", basePrice: 1400 },
  { trainName: "Humsafar Express", trainNumber: "12595", class: "AC 3-Tier", basePrice: 2000 },
  { trainName: "Tejas Express", trainNumber: "12150", class: "AC Chair Car", basePrice: 2500 }
];

// Enhanced hotel templates with more varieties
const hotelTemplates = [
  { name: "Grand Hyatt", category: "5-Star", basePrice: 8500, amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Bar"] },
  { name: "Marriott", category: "5-Star", basePrice: 7800, amenities: ["WiFi", "Pool", "Restaurant", "Gym", "Business Center"] },
  { name: "Taj Hotel", category: "5-Star", basePrice: 9500, amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Concierge"] },
  { name: "ITC Hotel", category: "5-Star", basePrice: 8800, amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Golf Course"] },
  { name: "Radisson Blu", category: "4-Star", basePrice: 5500, amenities: ["WiFi", "Pool", "Restaurant", "Gym"] },
  { name: "Holiday Inn", category: "4-Star", basePrice: 4800, amenities: ["WiFi", "Pool", "Restaurant", "Business Center"] },
  { name: "Novotel", category: "4-Star", basePrice: 5200, amenities: ["WiFi", "Pool", "Restaurant", "Kids Club"] },
  { name: "Best Western", category: "3-Star", basePrice: 3500, amenities: ["WiFi", "Restaurant", "Gym"] },
  { name: "Ibis", category: "3-Star", basePrice: 3200, amenities: ["WiFi", "Restaurant", "24/7 Service"] },
  { name: "Red Fox Hotel", category: "3-Star", basePrice: 2800, amenities: ["WiFi", "Restaurant", "Parking"] }
];

// Major Indian cities with enhanced route network
const cities = [
  "Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", 
  "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur", 
  "Nagpur", "Indore", "Patna", "Bhopal", "Ludhiana", "Agra",
  "Nashik", "Vadodara", "Goa", "Kochi", "Coimbatore", "Visakhapatnam"
];

// Generate comprehensive bidirectional routes
function generateRoutes() {
  const routes = [];
  const routeDurations = {
    "Delhi-Mumbai": 2.5, "Mumbai-Delhi": 2.5,
    "Delhi-Bangalore": 3.0, "Bangalore-Delhi": 3.0,
    "Delhi-Chennai": 3.5, "Chennai-Delhi": 3.5,
    "Mumbai-Bangalore": 1.8, "Bangalore-Mumbai": 1.8,
    "Mumbai-Chennai": 2.2, "Chennai-Mumbai": 2.2,
    "Delhi-Kolkata": 2.8, "Kolkata-Delhi": 2.8,
    "Delhi-Hyderabad": 2.5, "Hyderabad-Delhi": 2.5,
    "Mumbai-Hyderabad": 1.5, "Hyderabad-Mumbai": 1.5,
    "Bangalore-Chennai": 1.2, "Chennai-Bangalore": 1.2,
    "Delhi-Pune": 2.2, "Pune-Delhi": 2.2,
    "Mumbai-Pune": 0.5, "Pune-Mumbai": 0.5,
    "Delhi-Jaipur": 1.0, "Jaipur-Delhi": 1.0,
    "Mumbai-Goa": 1.3, "Goa-Mumbai": 1.3,
    "Bangalore-Hyderabad": 1.5, "Hyderabad-Bangalore": 1.5,
    "Chennai-Kochi": 1.5, "Kochi-Chennai": 1.5
  };

  // Add predefined routes with durations
  for (const [route, duration] of Object.entries(routeDurations)) {
    const [source, destination] = route.split('-');
    routes.push({ source, destination, duration });
  }

  // Generate additional routes for variety
  for (let i = 0; i < cities.length; i++) {
    for (let j = 0; j < cities.length; j++) {
      if (i !== j) {
        const source = cities[i];
        const destination = cities[j];
        const routeKey = `${source}-${destination}`;
        
        // If route not already defined, add with calculated duration
        if (!routeDurations[routeKey]) {
          const distance = Math.random() * 3 + 1; // 1-4 hours flight time
          routes.push({ source, destination, duration: Math.round(distance * 10) / 10 });
        }
      }
    }
  }

  return routes;
}

async function generateEnhancedData() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    const collections = ['flights', 'trains', 'hotels', 'admins', 'users', 'bookings'];
    for (const collection of collections) {
      await db.collection(collection).deleteMany({});
      console.log(`   Cleared ${collection}`);
    }
    
    // Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.collection('admins').insertOne({
      name: 'Admin User',
      email: 'admin@travelease.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const routes = generateRoutes();
    const flights = [];
    const trains = [];
    const hotels = [];
    
    console.log('🚀 Generating comprehensive data...');
    
    // Generate 150+ flights with variety
    console.log('✈️  Generating 150+ flights...');
    for (let i = 0; i < 160; i++) {
      const template = flightTemplates[Math.floor(Math.random() * flightTemplates.length)];
      const route = routes[Math.floor(Math.random() * routes.length)];
      
      // Generate date within next 90 days
      const departureDate = new Date();
      departureDate.setDate(departureDate.getDate() + Math.floor(Math.random() * 90) + 1);
      
      // Random departure time
      const hour = 6 + Math.floor(Math.random() * 16); // 6 AM to 10 PM
      const minute = Math.floor(Math.random() * 60);
      departureDate.setHours(hour, minute, 0, 0);
      
      const arrivalDate = new Date(departureDate);
      arrivalDate.setHours(arrivalDate.getHours() + route.duration);
      
      // Random pricing with variations
      const priceVariation = (Math.random() - 0.5) * 0.4; // ±20% variation
      const finalPrice = Math.round(template.basePrice * (1 + priceVariation));
      
      const totalSeats = 120 + Math.floor(Math.random() * 180); // 120-300 seats
      const availableSeats = Math.floor(totalSeats * (0.3 + Math.random() * 0.6)); // 30-90% available
      
      flights.push({
        flightNumber: `${template.flightNumber}${String(Math.floor(Math.random() * 9000) + 1000)}`,
        airline: template.airline,
        source: route.source,
        destination: route.destination,
        departureTime: departureDate,
        arrivalTime: arrivalDate,
        price: finalPrice,
        availableSeats: availableSeats,
        totalSeats: totalSeats,
        aircraft: template.aircraft,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Generate 120+ trains with bidirectional routes
    console.log('🚂 Generating 120+ trains with bidirectional routes...');
    const majorRoutes = [
      "Delhi-Mumbai", "Mumbai-Delhi",
      "Delhi-Chennai", "Chennai-Delhi", 
      "Delhi-Bangalore", "Bangalore-Delhi",
      "Mumbai-Chennai", "Chennai-Mumbai",
      "Mumbai-Bangalore", "Bangalore-Mumbai",
      "Delhi-Kolkata", "Kolkata-Delhi",
      "Delhi-Hyderabad", "Hyderabad-Delhi",
      "Mumbai-Hyderabad", "Hyderabad-Mumbai"
    ];
    
    // Generate bidirectional trains for major routes
    for (let i = 0; i < 130; i++) {
      const template = trainTemplates[Math.floor(Math.random() * trainTemplates.length)];
      
      // For first 80 trains, use major bidirectional routes
      let route;
      if (i < 80) {
        const routeStr = majorRoutes[i % majorRoutes.length];
        const [source, destination] = routeStr.split('-');
        route = { source, destination, duration: 12 + Math.random() * 20 }; // 12-32 hours
      } else {
        route = routes[Math.floor(Math.random() * routes.length)];
        route.duration = route.duration * 4 + Math.random() * 8; // Convert flight time to train time
      }
      
      // Generate date within next 60 days
      const departureDate = new Date();
      departureDate.setDate(departureDate.getDate() + Math.floor(Math.random() * 60) + 1);
      
      // Random departure time (trains can depart any time)
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      departureDate.setHours(hour, minute, 0, 0);
      
      const arrivalDate = new Date(departureDate);
      arrivalDate.setHours(arrivalDate.getHours() + route.duration);
      
      // Random pricing with variations
      const priceVariation = (Math.random() - 0.5) * 0.3;
      const finalPrice = Math.round(template.basePrice * (1 + priceVariation));
      
      const totalSeats = 200 + Math.floor(Math.random() * 300); // 200-500 seats
      const availableSeats = Math.floor(totalSeats * (0.4 + Math.random() * 0.5)); // 40-90% available
      
      trains.push({
        trainNumber: `${template.trainNumber}${String(Math.floor(Math.random() * 900) + 100)}`,
        trainName: template.trainName,
        source: route.source,
        destination: route.destination,
        departureTime: departureDate,
        arrivalTime: arrivalDate,
        price: finalPrice,
        availableSeats: availableSeats,
        totalSeats: totalSeats,
        class: template.class,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Generate 120+ hotels across all cities
    console.log('🏨 Generating 120+ hotels...');
    for (let i = 0; i < 140; i++) {
      const template = hotelTemplates[Math.floor(Math.random() * hotelTemplates.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      
      // Generate check-in date within next 90 days
      const checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() + Math.floor(Math.random() * 90) + 1);
      
      // Random pricing with city-based variations
      let cityMultiplier = 1.0;
      if (['Mumbai', 'Delhi', 'Bangalore'].includes(city)) cityMultiplier = 1.3;
      if (['Chennai', 'Hyderabad', 'Pune'].includes(city)) cityMultiplier = 1.1;
      if (['Goa', 'Kochi'].includes(city)) cityMultiplier = 1.2;
      
      const priceVariation = (Math.random() - 0.5) * 0.3;
      const finalPrice = Math.round(template.basePrice * cityMultiplier * (1 + priceVariation));
      
      const totalRooms = 20 + Math.floor(Math.random() * 180); // 20-200 rooms
      const availableRooms = Math.floor(totalRooms * (0.3 + Math.random() * 0.6)); // 30-90% available
      
      hotels.push({
        name: `${template.name} ${city}`,
        location: city,
        roomType: ['Deluxe', 'Suite', 'Executive', 'Standard', 'Premium'][Math.floor(Math.random() * 5)],
        price: finalPrice,
        availableRooms: availableRooms,
        totalRooms: totalRooms,
        checkIn: checkInDate,
        amenities: template.amenities,
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10, // 3.5-5.0 rating
        category: template.category,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Insert all data
    console.log('💾 Inserting data into database...');
    
    console.log(`   Inserting ${flights.length} flights...`);
    await db.collection('flights').insertMany(flights);
    
    console.log(`   Inserting ${trains.length} trains...`);
    await db.collection('trains').insertMany(trains);
    
    console.log(`   Inserting ${hotels.length} hotels...`);
    await db.collection('hotels').insertMany(hotels);
    
    // Create indexes
    console.log('📊 Creating indexes...');
    await db.collection('flights').createIndex({ source: 1, destination: 1, departureTime: 1 });
    await db.collection('flights').createIndex({ flightNumber: 1 }, { unique: true });
    await db.collection('trains').createIndex({ source: 1, destination: 1, departureTime: 1 });
    await db.collection('trains').createIndex({ trainNumber: 1 }, { unique: true });
    await db.collection('hotels').createIndex({ location: 1, checkIn: 1 });
    await db.collection('admins').createIndex({ email: 1 }, { unique: true });
    
    console.log('✅ Enhanced comprehensive data generation completed!');
    console.log(`📈 Final counts:`);
    console.log(`   Flights: ${flights.length}`);
    console.log(`   Trains: ${trains.length}`);
    console.log(`   Hotels: ${hotels.length}`);
    console.log(`   Admin: 1`);
    console.log('');
    console.log('🔑 Admin Login Credentials:');
    console.log('   Email: admin@travelease.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error generating enhanced data:', error);
  } finally {
    await client.close();
  }
}

// Run the generator
generateEnhancedData();