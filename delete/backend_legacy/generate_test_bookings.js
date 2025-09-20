const mongoose = require('mongoose');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Flight = require('./models/Flight');
const Train = require('./models/Train');
const Hotel = require('./models/Hotel');

async function generateTestBookings() {
  try {
    await mongoose.connect('mongodb://localhost:27017/online_booking_system');
    console.log('Connected to MongoDB');

    // First, let's create some test users
    console.log('Creating test users...');
    const testUsers = [];
    
    for (let i = 1; i <= 20; i++) {
      const user = new User({
        name: `Test User ${i}`,
        email: `testuser${i}@example.com`,
        phone: `+91${9000000000 + i}`,
        passwordHash: 'hashedpassword123' // This will be hashed by the pre-save middleware
      });
      
      try {
        const savedUser = await user.save();
        testUsers.push(savedUser);
      } catch (error) {
        if (error.code !== 11000) { // Ignore duplicate key errors
          console.error(`Error creating user ${i}:`, error.message);
        }
      }
    }
    
    // Get existing users if creation failed due to duplicates
    const allUsers = await User.find({});
    console.log(`Total users available: ${allUsers.length}`);

    if (allUsers.length === 0) {
      console.log('No users found. Cannot create bookings.');
      return;
    }

    // Get some flights, trains, and hotels for bookings
    const flights = await Flight.find().limit(10);
    const trains = await Train.find().limit(10);
    const hotels = await Hotel.find().limit(10);
    
    console.log(`Found ${flights.length} flights, ${trains.length} trains, ${hotels.length} hotels`);

    // Generate flight bookings
    console.log('Generating flight bookings...');
    for (let i = 0; i < 30; i++) {
      if (flights.length === 0) break;
      
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
      const randomFlight = flights[Math.floor(Math.random() * flights.length)];
      const randomDate = getRandomDate();
      const passengers = Math.floor(Math.random() * 4) + 1;
      
      const booking = new Booking({
        user: randomUser._id,
        bookingType: 'flight',
        trip: {
          flightDetails: {
            flightId: randomFlight._id,
            airline: randomFlight.airline,
            flightNumber: randomFlight.flightNumber,
            source: randomFlight.source,
            destination: randomFlight.destination,
            departureTime: randomFlight.departureTime,
            arrivalTime: randomFlight.arrivalTime,
            price: randomFlight.price,
            class: getRandomFlightClass()
          }
        },
        passengers: passengers,
        totalAmount: randomFlight.price * passengers,
        status: getRandomStatus(),
        bookingDate: randomDate,
        createdAt: randomDate,
        updatedAt: randomDate
      });
      
      try {
        await booking.save();
        console.log(`✅ Created flight booking ${i + 1}`);
      } catch (error) {
        console.error(`❌ Error creating flight booking ${i + 1}:`, error.message);
      }
    }

    // Generate train bookings
    console.log('Generating train bookings...');
    for (let i = 0; i < 25; i++) {
      if (trains.length === 0) break;
      
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
      const randomTrain = trains[Math.floor(Math.random() * trains.length)];
      const randomDate = getRandomDate();
      const passengers = Math.floor(Math.random() * 4) + 1;
      
      const booking = new Booking({
        user: randomUser._id,
        bookingType: 'train',
        trip: {
          trainDetails: {
            trainId: randomTrain._id,
            trainName: randomTrain.trainName,
            trainNumber: randomTrain.trainNumber,
            source: randomTrain.source,
            destination: randomTrain.destination,
            departureTime: randomTrain.departureTime,
            arrivalTime: randomTrain.arrivalTime,
            price: randomTrain.price,
            class: getRandomTrainClass()
          }
        },
        passengers: passengers,
        totalAmount: randomTrain.price * passengers,
        status: getRandomStatus(),
        bookingDate: randomDate,
        createdAt: randomDate,
        updatedAt: randomDate
      });
      
      try {
        await booking.save();
        console.log(`✅ Created train booking ${i + 1}`);
      } catch (error) {
        console.error(`❌ Error creating train booking ${i + 1}:`, error.message);
      }
    }

    // Generate hotel bookings
    console.log('Generating hotel bookings...');
    for (let i = 0; i < 20; i++) {
      if (hotels.length === 0) break;
      
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
      const randomHotel = hotels[Math.floor(Math.random() * hotels.length)];
      const randomDate = getRandomDate();
      const checkIn = getRandomFutureDate();
      const checkOut = new Date(checkIn.getTime() + (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000);
      const rooms = Math.floor(Math.random() * 3) + 1;
      const nights = Math.ceil((checkOut - checkIn) / (24 * 60 * 60 * 1000));
      
      const booking = new Booking({
        user: randomUser._id,
        bookingType: 'hotel',
        trip: {
          hotelDetails: {
            hotelId: randomHotel._id,
            hotelName: randomHotel.name,
            location: randomHotel.location,
            checkIn: checkIn,
            checkOut: checkOut,
            rooms: rooms,
            roomType: randomHotel.roomType || 'Standard',
            pricePerNight: randomHotel.price
          }
        },
        totalAmount: randomHotel.price * nights * rooms,
        status: getRandomStatus(),
        bookingDate: randomDate,
        createdAt: randomDate,
        updatedAt: randomDate
      });
      
      try {
        await booking.save();
        console.log(`✅ Created hotel booking ${i + 1}`);
      } catch (error) {
        console.error(`❌ Error creating hotel booking ${i + 1}:`, error.message);
      }
    }

    // Display summary
    const totalBookings = await Booking.countDocuments();
    const flightBookings = await Booking.countDocuments({ bookingType: 'flight' });
    const trainBookings = await Booking.countDocuments({ bookingType: 'train' });
    const hotelBookings = await Booking.countDocuments({ bookingType: 'hotel' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    console.log('\n📊 BOOKING SUMMARY:');
    console.log(`Total Bookings: ${totalBookings}`);
    console.log(`Flight Bookings: ${flightBookings}`);
    console.log(`Train Bookings: ${trainBookings}`);
    console.log(`Hotel Bookings: ${hotelBookings}`);
    console.log(`Confirmed: ${confirmedBookings}`);
    console.log(`Pending: ${pendingBookings}`);
    console.log(`Cancelled: ${cancelledBookings}`);
    
    console.log('\n🎉 Test bookings generated successfully! The admin panel graphs should now show data.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

function getRandomDate() {
  const start = new Date();
  start.setMonth(start.getMonth() - 6); // 6 months ago
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomFutureDate() {
  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 3); // 3 months from now
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomStatus() {
  const statuses = ['confirmed', 'pending', 'cancelled'];
  const weights = [0.6, 0.3, 0.1]; // 60% confirmed, 30% pending, 10% cancelled
  const random = Math.random();
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (random <= sum) {
      return statuses[i];
    }
  }
  return 'confirmed';
}

function getRandomFlightClass() {
  const classes = ['Economy', 'Premium Economy', 'Business', 'First'];
  const weights = [0.7, 0.15, 0.1, 0.05];
  const random = Math.random();
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (random <= sum) {
      return classes[i];
    }
  }
  return 'Economy';
}

function getRandomTrainClass() {
  const classes = ['Sleeper', 'AC 3-Tier', 'AC 2-Tier', 'AC 1-Tier', 'Chair Car'];
  return classes[Math.floor(Math.random() * classes.length)];
}

// Run the script
generateTestBookings();