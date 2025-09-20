// Comprehensive Route Data Generator for Online Booking System
// This script generates flights, trains, and hotels with bidirectional routes and diverse destinations

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'online_booking_system';

// Comprehensive Indian destinations with their regions
const DESTINATIONS = {
  'North India': ['Delhi', 'Jaipur', 'Agra', 'Chandigarh', 'Amritsar', 'Shimla', 'Manali', 'Dehradun'],
  'West India': ['Mumbai', 'Pune', 'Ahmedabad', 'Surat', 'Goa', 'Nagpur', 'Indore', 'Bhopal'],
  'South India': ['Bangalore', 'Chennai', 'Hyderabad', 'Kochi', 'Mysore', 'Coimbatore', 'Trivandrum', 'Mangalore'],
  'East India': ['Kolkata', 'Bhubaneswar', 'Patna', 'Ranchi', 'Guwahati', 'Siliguri', 'Jamshedpur', 'Cuttack'],
  'Central India': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Raipur', 'Bilaspur', 'Ujjain', 'Sagar']
};

// Flight templates with more airlines
const FLIGHT_TEMPLATES = [
  { airline: "Air India", flightNumber: "AI", aircraft: "Boeing 737", basePrice: 4500 },
  { airline: "IndiGo", flightNumber: "6E", aircraft: "Airbus A320", basePrice: 3800 },
  { airline: "SpiceJet", flightNumber: "SG", aircraft: "Boeing 737", basePrice: 4200 },
  { airline: "Vistara", flightNumber: "UK", aircraft: "Airbus A320", basePrice: 5000 },
  { airline: "GoAir", flightNumber: "G8", aircraft: "Airbus A320", basePrice: 3600 },
  { airline: "AirAsia India", flightNumber: "I5", aircraft: "Airbus A320", basePrice: 3400 },
  { airline: "Alliance Air", flightNumber: "9I", aircraft: "ATR 72", basePrice: 4000 },
  { airline: "TruJet", flightNumber: "2T", aircraft: "ATR 72", basePrice: 3200 }
];

// Train templates with more variety
const TRAIN_TEMPLATES = [
  { trainName: "Rajdhani Express", trainNumber: "12345", class: "AC 2-Tier", basePrice: 2500 },
  { trainName: "Shatabdi Express", trainNumber: "12346", class: "AC Chair Car", basePrice: 1800 },
  { trainName: "Karnataka Express", trainNumber: "12627", class: "AC 3-Tier", basePrice: 2000 },
  { trainName: "Tamil Nadu Express", trainNumber: "12628", class: "AC 3-Tier", basePrice: 2200 },
  { trainName: "Goa Express", trainNumber: "12779", class: "AC 2-Tier", basePrice: 2400 },
  { trainName: "Duronto Express", trainNumber: "12213", class: "AC 2-Tier", basePrice: 2600 },
  { trainName: "Garib Rath", trainNumber: "12213", class: "AC 3-Tier", basePrice: 1500 },
  { trainName: "Jan Shatabdi", trainNumber: "12045", class: "AC Chair Car", basePrice: 1600 },
  { trainName: "Vande Bharat", trainNumber: "22201", class: "AC Chair Car", basePrice: 2800 },
  { trainName: "Tejas Express", trainNumber: "22120", class: "AC Chair Car", basePrice: 2700 }
];

// Hotel templates with more variety
const HOTEL_TEMPLATES = [
  { name: "Grand Hotel", basePrice: 3500, roomType: "Deluxe", amenities: ["WiFi", "Pool", "Gym", "Restaurant"] },
  { name: "Palace Hotel", basePrice: 4200, roomType: "Suite", amenities: ["WiFi", "Spa", "Restaurant", "Bar"] },
  { name: "Beach Resort", basePrice: 5500, roomType: "Ocean View", amenities: ["WiFi", "Beach Access", "Pool", "Water Sports"] },
  { name: "Garden Hotel", basePrice: 3800, roomType: "Executive", amenities: ["WiFi", "Garden", "Restaurant", "Business Center"] },
  { name: "City Center", basePrice: 3200, roomType: "Standard", amenities: ["WiFi", "Restaurant", "Room Service"] },
  { name: "Business Hotel", basePrice: 4000, roomType: "Business", amenities: ["WiFi", "Business Center", "Conference Room", "Restaurant"] },
  { name: "Boutique Hotel", basePrice: 4500, roomType: "Boutique", amenities: ["WiFi", "Spa", "Restaurant", "Bar", "Pool"] },
  { name: "Heritage Hotel", basePrice: 5000, roomType: "Heritage", amenities: ["WiFi", "Cultural Tours", "Restaurant", "Bar", "Spa"] },
  { name: "Budget Hotel", basePrice: 2500, roomType: "Budget", amenities: ["WiFi", "Restaurant"] },
  { name: "Luxury Resort", basePrice: 6000, roomType: "Luxury", amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Bar", "Gym", "Beach Access"] }
];

// Generate all possible routes between destinations
function generateAllRoutes() {
  const routes = [];
  const allDestinations = Object.values(DESTINATIONS).flat();
  
  // Create bidirectional routes between all major destinations
  for (let i = 0; i < allDestinations.length; i++) {
    for (let j = i + 1; j < allDestinations.length; j++) {
      const source = allDestinations[i];
      const destination = allDestinations[j];
      
      // Calculate approximate duration based on distance
      const duration = calculateDuration(source, destination);
      
      // Add both directions
      routes.push({
        source: source,
        destination: destination,
        duration: duration,
        distance: calculateDistance(source, destination)
      });
      
      routes.push({
        source: destination,
        destination: source,
        duration: duration,
        distance: calculateDistance(destination, source)
      });
    }
  }
  
  return routes;
}

// Calculate approximate flight duration based on distance
function calculateDuration(source, destination) {
  const distances = {
    'Delhi': { 'Mumbai': 2.5, 'Bangalore': 3.0, 'Chennai': 3.5, 'Kolkata': 2.0, 'Hyderabad': 2.5, 'Goa': 2.5, 'Jaipur': 1.0, 'Agra': 0.5, 'Chandigarh': 1.0, 'Amritsar': 1.5, 'Shimla': 1.5, 'Manali': 2.0, 'Dehradun': 1.0, 'Pune': 2.0, 'Ahmedabad': 2.0, 'Surat': 2.5, 'Nagpur': 2.0, 'Indore': 1.5, 'Bhopal': 1.5, 'Kochi': 3.5, 'Mysore': 3.0, 'Coimbatore': 3.5, 'Trivandrum': 4.0, 'Mangalore': 3.0, 'Bhubaneswar': 2.5, 'Patna': 1.5, 'Ranchi': 2.0, 'Guwahati': 2.5, 'Siliguri': 2.0, 'Jamshedpur': 2.0, 'Cuttack': 2.5, 'Gwalior': 1.0, 'Jabalpur': 2.0, 'Raipur': 2.5, 'Bilaspur': 2.5, 'Ujjain': 1.5, 'Sagar': 1.5 },
    'Mumbai': { 'Bangalore': 1.5, 'Chennai': 2.0, 'Kolkata': 3.0, 'Hyderabad': 1.5, 'Goa': 1.0, 'Pune': 0.5, 'Ahmedabad': 1.0, 'Surat': 0.5, 'Nagpur': 1.5, 'Indore': 1.0, 'Bhopal': 1.5, 'Kochi': 2.0, 'Mysore': 1.5, 'Coimbatore': 2.0, 'Trivandrum': 2.5, 'Mangalore': 1.5, 'Bhubaneswar': 2.5, 'Patna': 2.5, 'Ranchi': 2.5, 'Guwahati': 3.5, 'Siliguri': 3.0, 'Jamshedpur': 2.5, 'Cuttack': 2.5, 'Gwalior': 1.5, 'Jabalpur': 2.0, 'Raipur': 2.0, 'Bilaspur': 2.0, 'Ujjain': 1.0, 'Sagar': 1.5 },
    'Bangalore': { 'Chennai': 1.0, 'Kolkata': 3.0, 'Hyderabad': 1.5, 'Goa': 1.5, 'Kochi': 1.5, 'Mysore': 0.5, 'Coimbatore': 1.0, 'Trivandrum': 2.0, 'Mangalore': 1.0, 'Bhubaneswar': 2.5, 'Patna': 3.0, 'Ranchi': 2.5, 'Guwahati': 3.5, 'Siliguri': 3.0, 'Jamshedpur': 2.5, 'Cuttack': 2.5, 'Gwalior': 2.5, 'Jabalpur': 2.5, 'Raipur': 2.0, 'Bilaspur': 2.0, 'Ujjain': 2.0, 'Sagar': 2.0 },
    'Chennai': { 'Kolkata': 2.5, 'Hyderabad': 1.5, 'Goa': 2.0, 'Kochi': 1.5, 'Mysore': 1.0, 'Coimbatore': 1.0, 'Trivandrum': 1.5, 'Mangalore': 1.5, 'Bhubaneswar': 2.0, 'Patna': 2.5, 'Ranchi': 2.0, 'Guwahati': 3.0, 'Siliguri': 2.5, 'Jamshedpur': 2.0, 'Cuttack': 2.0, 'Gwalior': 2.5, 'Jabalpur': 2.5, 'Raipur': 2.5, 'Bilaspur': 2.5, 'Ujjain': 2.5, 'Sagar': 2.5 },
    'Kolkata': { 'Hyderabad': 2.5, 'Goa': 3.0, 'Bhubaneswar': 1.0, 'Patna': 1.5, 'Ranchi': 1.0, 'Guwahati': 1.5, 'Siliguri': 1.0, 'Jamshedpur': 0.5, 'Cuttack': 1.0, 'Gwalior': 2.0, 'Jabalpur': 2.0, 'Raipur': 2.0, 'Bilaspur': 2.0, 'Ujjain': 2.5, 'Sagar': 2.0 },
    'Hyderabad': { 'Goa': 2.0, 'Kochi': 2.0, 'Mysore': 1.5, 'Coimbatore': 1.5, 'Trivandrum': 2.5, 'Mangalore': 1.5, 'Bhubaneswar': 2.0, 'Patna': 2.5, 'Ranchi': 2.0, 'Guwahati': 3.0, 'Siliguri': 2.5, 'Jamshedpur': 2.0, 'Cuttack': 2.0, 'Gwalior': 2.0, 'Jabalpur': 2.0, 'Raipur': 1.5, 'Bilaspur': 1.5, 'Ujjain': 1.5, 'Sagar': 1.5 },
    'Goa': { 'Kochi': 1.5, 'Mysore': 1.5, 'Coimbatore': 1.5, 'Trivandrum': 2.0, 'Mangalore': 1.0, 'Bhubaneswar': 2.5, 'Patna': 3.0, 'Ranchi': 2.5, 'Guwahati': 3.5, 'Siliguri': 3.0, 'Jamshedpur': 2.5, 'Cuttack': 2.5, 'Gwalior': 2.0, 'Jabalpur': 2.5, 'Raipur': 2.0, 'Bilaspur': 2.0, 'Ujjain': 1.5, 'Sagar': 2.0 }
  };
  
  return distances[source]?.[destination] || 2.0; // Default 2 hours
}

// Calculate approximate distance (simplified)
function calculateDistance(source, destination) {
  const distances = {
    'Delhi': { 'Mumbai': 1400, 'Bangalore': 2100, 'Chennai': 2200, 'Kolkata': 1500, 'Hyderabad': 1600, 'Goa': 1800, 'Jaipur': 280, 'Agra': 200, 'Chandigarh': 250, 'Amritsar': 450, 'Shimla': 350, 'Manali': 550, 'Dehradun': 250, 'Pune': 1200, 'Ahmedabad': 900, 'Surat': 1100, 'Nagpur': 1000, 'Indore': 800, 'Bhopal': 750, 'Kochi': 2400, 'Mysore': 2000, 'Coimbatore': 2200, 'Trivandrum': 2500, 'Mangalore': 2100, 'Bhubaneswar': 1800, 'Patna': 1000, 'Ranchi': 1200, 'Guwahati': 1800, 'Siliguri': 1500, 'Jamshedpur': 1200, 'Cuttack': 1800, 'Gwalior': 400, 'Jabalpur': 800, 'Raipur': 1200, 'Bilaspur': 1200, 'Ujjain': 700, 'Sagar': 600 },
    'Mumbai': { 'Bangalore': 850, 'Chennai': 1300, 'Kolkata': 2000, 'Hyderabad': 700, 'Goa': 600, 'Pune': 150, 'Ahmedabad': 530, 'Surat': 300, 'Nagpur': 800, 'Indore': 600, 'Bhopal': 800, 'Kochi': 1400, 'Mysore': 1000, 'Coimbatore': 1200, 'Trivandrum': 1500, 'Mangalore': 900, 'Bhubaneswar': 1800, 'Patna': 1800, 'Ranchi': 1800, 'Guwahati': 2400, 'Siliguri': 2100, 'Jamshedpur': 1800, 'Cuttack': 1800, 'Gwalior': 1000, 'Jabalpur': 1200, 'Raipur': 1000, 'Bilaspur': 1000, 'Ujjain': 500, 'Sagar': 800 }
  };
  
  return distances[source]?.[destination] || 1000; // Default 1000 km
}

// Generate unique flight number
function generateFlightNumber(template, route, date) {
  const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 900) + 100;
  return `${template.flightNumber}${randomNum}`;
}

// Generate unique train number
function generateTrainNumber(template, route, date) {
  const dateStr = date.toISOString().slice(8, 10);
  const randomNum = Math.floor(Math.random() * 90) + 10;
  return `${template.trainNumber}${randomNum}`;
}

// Check if record already exists
async function recordExists(collection, query) {
  const count = await collection.countDocuments(query);
  return count > 0;
}

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
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 90); // Generate for next 90 days
    
    console.log(`Generating data from ${startDate.toDateString()} to ${endDate.toDateString()}`);
    
    const routes = generateAllRoutes();
    console.log(`Generated ${routes.length} routes`);
    
    const flights = [];
    const trains = [];
    const hotels = [];
    
    // Generate data for each day
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const currentDate = new Date(date);
      
      // Generate flights for each route
      for (const route of routes) {
        // Skip some routes randomly to avoid too many flights
        if (Math.random() > 0.3) continue;
        
        const template = FLIGHT_TEMPLATES[Math.floor(Math.random() * FLIGHT_TEMPLATES.length)];
        const flightNumber = generateFlightNumber(template, route, currentDate);
        
        // Check for duplicates
        const existingFlight = await recordExists(db.collection('flights'), {
          flightNumber: flightNumber,
          source: route.source,
          destination: route.destination,
          departureTime: {
            $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
            $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
          }
        });
        
        if (existingFlight) continue;
        
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
      
      // Generate trains for each route (less frequent than flights)
      for (const route of routes) {
        // Skip some routes randomly
        if (Math.random() > 0.2) continue;
        
        const template = TRAIN_TEMPLATES[Math.floor(Math.random() * TRAIN_TEMPLATES.length)];
        const trainNumber = generateTrainNumber(template, route, currentDate);
        
        // Check for duplicates
        const existingTrain = await recordExists(db.collection('trains'), {
          trainNumber: trainNumber,
          source: route.source,
          destination: route.destination,
          departureTime: {
            $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
            $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
          }
        });
        
        if (existingTrain) continue;
        
        const departureTime = new Date(currentDate);
        departureTime.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);
        
        const arrivalTime = new Date(departureTime);
        arrivalTime.setHours(arrivalTime.getHours() + route.duration * 2 + Math.floor(Math.random() * 4)); // Trains take longer
        
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
    const allDestinations = Object.values(DESTINATIONS).flat();
    for (const destination of allDestinations) {
      // Generate 3-5 hotels per destination
      const numHotels = 3 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numHotels; i++) {
        const template = HOTEL_TEMPLATES[Math.floor(Math.random() * HOTEL_TEMPLATES.length)];
        
        // Check for duplicates
        const existingHotel = await recordExists(db.collection('hotels'), {
          name: template.name,
          location: destination
        });
        
        if (existingHotel) continue;
        
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
    
    // Insert data in batches
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
    
    console.log('✅ Comprehensive data generation completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Routes: ${routes.length}`);
    console.log(`   - Flights: ${flights.length}`);
    console.log(`   - Trains: ${trains.length}`);
    console.log(`   - Hotels: ${hotels.length}`);
    console.log(`   - Destinations: ${allDestinations.length}`);
    
  } catch (error) {
    console.error('❌ Error generating data:', error);
  } finally {
    await client.close();
  }
}

// Run the generator
if (require.main === module) {
  generateComprehensiveData();
}

module.exports = { generateComprehensiveData };
