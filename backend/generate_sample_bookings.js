const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Flight = require('./models/Flight');
const Train = require('./models/Train');
const Hotel = require('./models/Hotel');
const Booking = require('./models/Booking');

async function generateSampleBookings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get existing users, flights, trains, and hotels
    const users = await User.find().limit(5);
    const flights = await Flight.find().limit(5);
    const trains = await Train.find().limit(5);
    const hotels = await Hotel.find().limit(5);

    if (users.length === 0 || flights.length === 0 || trains.length === 0 || hotels.length === 0) {
      console.log('Please run database_setup.js first to create sample data');
      return;
    }

    // Clear existing bookings
    await Booking.deleteMany({});
    console.log('Cleared existing bookings');

    const bookings = [];
    const statuses = ['confirmed', 'pending', 'cancelled'];
    const bookingTypes = ['flight', 'train', 'hotel'];

    // Generate 50 sample bookings
    for (let i = 0; i < 50; i++) {
      const bookingType = bookingTypes[Math.floor(Math.random() * bookingTypes.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Random date in the last 6 months
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() - Math.floor(Math.random() * 180));

      let trip, totalAmount;
      const tripStartDate = new Date(bookingDate);
      const tripEndDate = new Date(tripStartDate);
      tripEndDate.setDate(tripEndDate.getDate() + Math.floor(Math.random() * 5) + 1);

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
              class: train.class || 'AC 3-Tier',
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

      const booking = {
        userId: user._id,
        bookingType: bookingType,
        trip: trip,
        totalAmount: totalAmount,
        status: status,
        bookingDate: bookingDate,
        paymentStatus: status === 'confirmed' ? 'completed' : status === 'pending' ? 'pending' : 'failed',
        createdAt: bookingDate,
        updatedAt: bookingDate
      };

      bookings.push(booking);
    }

    // Insert all bookings
    await Booking.insertMany(bookings);
    console.log(`Generated ${bookings.length} sample bookings`);

    // Display summary
    const summary = await Booking.aggregate([
      { $group: { 
          _id: { type: '$bookingType', status: '$status' }, 
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.type': 1, '_id.status': 1 } }
    ]);

    console.log('\nBooking Summary:');
    summary.forEach(item => {
      console.log(`${item._id.type} (${item._id.status}): ${item.count} bookings, ₹${item.totalAmount.toLocaleString()}`);
    });

    console.log('\nSample bookings generated successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error generating sample bookings:', error);
    process.exit(1);
  }
}

generateSampleBookings();
