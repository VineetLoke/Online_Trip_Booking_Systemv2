// Complete the remaining data insertion with unique flight numbers
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'online_booking_system';

// Remaining templates
const flightTemplates = [
  { airline: "Air India", flightNumber: "AI", aircraft: "Boeing 737", basePrice: 4500 },
  { airline: "IndiGo", flightNumber: "6E", aircraft: "Airbus A320", basePrice: 3800 },
  { airline: "SpiceJet", flightNumber: "SG", aircraft: "Boeing 737", basePrice: 4200 },
  { airline: "Vistara", flightNumber: "UK", aircraft: "Airbus A320", basePrice: 5000 },
  { airline: "GoAir", flightNumber: "G8", aircraft: "Airbus A320", basePrice: 3600 }
];

const trainTemplates = [
  { trainName: "Rajdhani Express", trainNumber: "12301", class: "AC 1st Class", basePrice: 3500 },
  { trainName: "Shatabdi Express", trainNumber: "12002", class: "AC Chair Car", basePrice: 1800 },
  { trainName: "Duronto Express", trainNumber: "12259", class: "AC 2-Tier", basePrice: 2800 },
  { trainName: "Garib Rath", trainNumber: "12910", class: "AC 3-Tier", basePrice: 1500 },
  { trainName: "Jan Shatabdi", trainNumber: "12023", class: "AC Chair Car", basePrice: 1200 }
];

const hotelTemplates = [
  { name: "Grand Hyatt", category: "5-Star", basePrice: 8500, amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Bar"] },
  { name: "Marriott", category: "5-Star", basePrice: 7800, amenities: ["WiFi", "Pool", "Restaurant", "Gym", "Business Center"] },
  { name: "Taj Hotel", category: "5-Star", basePrice: 9500, amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Concierge"] },
  { name: "ITC Hotel", category: "5-Star", basePrice: 8800, amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Golf Course"] },
  { name: "Radisson Blu", category: "4-Star", basePrice: 5500, amenities: ["WiFi", "Pool", "Restaurant", "Gym"] }
];

const cities = [
  "Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", 
  "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur", 
  "Nagpur", "Indore", "Patna", "Bhopal", "Goa", "Kochi"
];

const routes = [
  { source: "Delhi", destination: "Mumbai", duration: 2.5 },
  { source: "Mumbai", destination: "Delhi", duration: 2.5 },
  { source: "Delhi", destination: "Bangalore", duration: 3.0 },
  { source: "Bangalore", destination: "Delhi", duration: 3.0 },
  { source: "Delhi", destination: "Chennai", duration: 3.5 },
  { source: "Chennai", destination: "Delhi", duration: 3.5 },
  { source: "Mumbai", destination: "Bangalore", duration: 1.8 },
  { source: "Bangalore", destination: "Mumbai", duration: 1.8 },
  { source: "Mumbai", destination: "Chennai", duration: 2.2 },
  { source: "Chennai", destination: "Mumbai", duration: 2.2 }
];

async function completeDataInsertion() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Get existing flight numbers to avoid duplicates
    const existingFlights = await db.collection('flights').find({}, { flightNumber: 1 }).toArray();
    const existingFlightNumbers = new Set(existingFlights.map(f => f.flightNumber));
    console.log(`📋 Found ${existingFlightNumbers.size} existing flight numbers`);
    
    const trains = [];
    const hotels = [];
    
    // Generate unique flight numbers and add remaining flights
    const remainingFlights = [];
    let flightCounter = 7000; // Start from a high number to avoid conflicts
    
    for (let i = 0; i < 40; i++) { // Add 40 more flights to reach 160+
      const template = flightTemplates[Math.floor(Math.random() * flightTemplates.length)];
      const route = routes[Math.floor(Math.random() * routes.length)];
      
      let flightNumber;
      do {
        flightNumber = `${template.flightNumber}${flightCounter++}`;
      } while (existingFlightNumbers.has(flightNumber));
      
      const departureDate = new Date();
      departureDate.setDate(departureDate.getDate() + Math.floor(Math.random() * 90) + 1);
      const hour = 6 + Math.floor(Math.random() * 16);
      const minute = Math.floor(Math.random() * 60);
      departureDate.setHours(hour, minute, 0, 0);
      
      const arrivalDate = new Date(departureDate);
      arrivalDate.setHours(arrivalDate.getHours() + route.duration);
      
      const priceVariation = (Math.random() - 0.5) * 0.4;
      const finalPrice = Math.round(template.basePrice * (1 + priceVariation));
      const totalSeats = 120 + Math.floor(Math.random() * 180);
      const availableSeats = Math.floor(totalSeats * (0.3 + Math.random() * 0.6));
      
      remainingFlights.push({
        flightNumber: flightNumber,
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
    
    // Generate trains with unique numbers
    console.log('🚂 Generating trains with bidirectional routes...');
    const existingTrains = await db.collection('trains').find({}, { trainNumber: 1 }).toArray();
    const existingTrainNumbers = new Set(existingTrains.map(t => t.trainNumber));
    
    let trainCounter = 15000;
    const majorRoutes = [
      "Delhi-Mumbai", "Mumbai-Delhi", "Delhi-Chennai", "Chennai-Delhi", 
      "Delhi-Bangalore", "Bangalore-Delhi", "Mumbai-Chennai", "Chennai-Mumbai",
      "Mumbai-Bangalore", "Bangalore-Mumbai", "Delhi-Kolkata", "Kolkata-Delhi"
    ];
    
    for (let i = 0; i < 130; i++) {
      const template = trainTemplates[Math.floor(Math.random() * trainTemplates.length)];
      
      let route;
      if (i < 60) {
        const routeStr = majorRoutes[i % majorRoutes.length];
        const [source, destination] = routeStr.split('-');
        route = { source, destination, duration: 12 + Math.random() * 20 };
      } else {
        route = routes[Math.floor(Math.random() * routes.length)];
        route.duration = route.duration * 4 + Math.random() * 8;
      }
      
      let trainNumber;
      do {
        trainNumber = `${trainCounter++}`;
      } while (existingTrainNumbers.has(trainNumber));
      
      const departureDate = new Date();
      departureDate.setDate(departureDate.getDate() + Math.floor(Math.random() * 60) + 1);
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      departureDate.setHours(hour, minute, 0, 0);
      
      const arrivalDate = new Date(departureDate);
      arrivalDate.setHours(arrivalDate.getHours() + route.duration);
      
      const priceVariation = (Math.random() - 0.5) * 0.3;
      const finalPrice = Math.round(template.basePrice * (1 + priceVariation));
      const totalSeats = 200 + Math.floor(Math.random() * 300);
      const availableSeats = Math.floor(totalSeats * (0.4 + Math.random() * 0.5));
      
      trains.push({
        trainNumber: trainNumber,
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
    
    // Generate hotels
    console.log('🏨 Generating hotels...');
    for (let i = 0; i < 140; i++) {
      const template = hotelTemplates[Math.floor(Math.random() * hotelTemplates.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      
      const checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() + Math.floor(Math.random() * 90) + 1);
      
      let cityMultiplier = 1.0;
      if (['Mumbai', 'Delhi', 'Bangalore'].includes(city)) cityMultiplier = 1.3;
      if (['Chennai', 'Hyderabad', 'Pune'].includes(city)) cityMultiplier = 1.1;
      if (['Goa', 'Kochi'].includes(city)) cityMultiplier = 1.2;
      
      const priceVariation = (Math.random() - 0.5) * 0.3;
      const finalPrice = Math.round(template.basePrice * cityMultiplier * (1 + priceVariation));
      const totalRooms = 20 + Math.floor(Math.random() * 180);
      const availableRooms = Math.floor(totalRooms * (0.3 + Math.random() * 0.6));
      
      hotels.push({
        name: `${template.name} ${city} ${i+1}`,
        location: city,
        roomType: ['Deluxe', 'Suite', 'Executive', 'Standard', 'Premium'][Math.floor(Math.random() * 5)],
        price: finalPrice,
        availableRooms: availableRooms,
        totalRooms: totalRooms,
        checkIn: checkInDate,
        amenities: template.amenities,
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        category: template.category,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Insert all remaining data
    console.log('💾 Inserting remaining data...');
    
    if (remainingFlights.length > 0) {
      console.log(`   Adding ${remainingFlights.length} more flights...`);
      await db.collection('flights').insertMany(remainingFlights);
    }
    
    console.log(`   Inserting ${trains.length} trains...`);
    await db.collection('trains').insertMany(trains);
    
    console.log(`   Inserting ${hotels.length} hotels...`);
    await db.collection('hotels').insertMany(hotels);
    
    // Final count check
    const finalCounts = {
      flights: await db.collection('flights').countDocuments(),
      trains: await db.collection('trains').countDocuments(),
      hotels: await db.collection('hotels').countDocuments(),
      admins: await db.collection('admins').countDocuments()
    };
    
    console.log('✅ Data insertion completed successfully!');
    console.log('📈 Final Database Contents:');
    console.log(`   Flights: ${finalCounts.flights}`);
    console.log(`   Trains: ${finalCounts.trains}`);
    console.log(`   Hotels: ${finalCounts.hotels}`);
    console.log(`   Admins: ${finalCounts.admins}`);
    console.log('');
    console.log('🔑 Admin Login Credentials:');
    console.log('   Email: admin@travelease.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error completing data insertion:', error);
  } finally {
    await client.close();
  }
}

completeDataInsertion();