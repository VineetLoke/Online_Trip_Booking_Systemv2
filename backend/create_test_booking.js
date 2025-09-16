require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

// Import models
const User = require('./models/User');
const Flight = require('./models/Flight');
const Booking = require('./models/Booking');

async function createTestBooking() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get or create a test user
    let user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      user = new User({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        passwordHash: 'hashedpassword123'
      });
      await user.save();
      console.log('Created test user');
    }

    // Get any flight
    const flight = await Flight.findOne();
    if (!flight) {
      console.log('No flights found. Please add flights first.');
      return;
    }

    // Create a test booking
    const booking = new Booking({
      userId: user._id,
      bookingType: 'flight',
      trip: {
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
      },
      totalAmount: flight.price,
      status: 'confirmed',
      paymentStatus: 'completed',
      bookingDate: new Date()
    });

    await booking.save();
    console.log('Created test booking:', booking._id);

    await mongoose.disconnect();
    console.log('Test booking created successfully!');

  } catch (error) {
    console.error('Error creating test booking:', error);
  }
}

createTestBooking();