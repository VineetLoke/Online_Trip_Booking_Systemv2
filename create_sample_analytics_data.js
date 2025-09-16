// Quick Sample Data Generator for Analytics Testing
const mongoose = require('mongoose');

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/online_booking_system';

// Import models - adjust paths as needed
const Booking = require('./backend/models/Booking');
const User = require('./backend/models/User');

async function createSampleData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Check if we already have bookings
    const existingBookings = await Booking.countDocuments();
    console.log(`📊 Found ${existingBookings} existing bookings`);
    
    if (existingBookings > 0) {
      console.log('✅ Bookings already exist. Skipping data generation.');
      console.log('Analytics should now work properly!');
      process.exit(0);
    }

    // Check if we have users
    const existingUsers = await User.countDocuments();
    console.log(`👥 Found ${existingUsers} existing users`);
    
    if (existingUsers === 0) {
      console.log('⚠️ No users found. Creating a sample user...');
      
      // Create a sample user
      const sampleUser = new User({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '9876543210',
        passwordHash: '$2b$10$placeholder.hash.for.testing.purposes'
      });
      
      await sampleUser.save();
      console.log('✅ Sample user created');
    }

    // Get first user
    const user = await User.findOne();
    console.log(`👤 Using user: ${user.name} (${user.email})`);

    console.log('📋 Creating sample bookings...');
    
    // Create sample bookings with various types and statuses
    const sampleBookings = [];
    
    // Flight bookings
    for (let i = 0; i < 15; i++) {
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() - Math.floor(Math.random() * 90)); // Random date in last 90 days
      
      sampleBookings.push({
        userId: user._id,
        bookingType: 'flight',
        bookingDate: bookingDate,
        status: ['confirmed', 'pending', 'cancelled'][Math.floor(Math.random() * 3)],
        totalAmount: 3000 + Math.floor(Math.random() * 5000),
        paymentStatus: 'completed',
        trip: {
          type: 'flight',
          destination: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'][Math.floor(Math.random() * 5)],
          startDate: bookingDate,
          endDate: new Date(bookingDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
          flightDetails: {
            flightNumber: `AI${100 + i}`,
            airline: 'Air India',
            source: 'Delhi',
            destination: ['Mumbai', 'Bangalore', 'Chennai'][Math.floor(Math.random() * 3)],
            passengerDetails: {
              name: user.name,
              age: 30,
              gender: 'Male'
            }
          }
        }
      });
    }
    
    // Train bookings
    for (let i = 0; i < 10; i++) {
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() - Math.floor(Math.random() * 90));
      
      sampleBookings.push({
        userId: user._id,
        bookingType: 'train',
        bookingDate: bookingDate,
        status: ['confirmed', 'pending', 'cancelled'][Math.floor(Math.random() * 3)],
        totalAmount: 1500 + Math.floor(Math.random() * 2000),
        paymentStatus: 'completed',
        trip: {
          type: 'train',
          destination: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'][Math.floor(Math.random() * 4)],
          startDate: bookingDate,
          endDate: new Date(bookingDate.getTime() + 12 * 60 * 60 * 1000), // 12 hours later
          trainDetails: {
            trainNumber: `${12300 + i}`,
            trainName: `Express ${i + 1}`,
            source: 'Delhi',
            destination: ['Mumbai', 'Bangalore', 'Chennai'][Math.floor(Math.random() * 3)],
            class: 'AC 3-Tier',
            passengerDetails: {
              name: user.name,
              age: 30,
              gender: 'Male'
            }
          }
        }
      });
    }
    
    // Hotel bookings
    for (let i = 0; i < 12; i++) {
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() - Math.floor(Math.random() * 90));
      const checkOut = new Date(bookingDate.getTime() + (2 + Math.floor(Math.random() * 5)) * 24 * 60 * 60 * 1000);
      
      sampleBookings.push({
        userId: user._id,
        bookingType: 'hotel',
        bookingDate: bookingDate,
        status: ['confirmed', 'pending', 'cancelled'][Math.floor(Math.random() * 3)],
        totalAmount: 2000 + Math.floor(Math.random() * 4000),
        paymentStatus: 'completed',
        trip: {
          type: 'hotel',
          destination: ['Mumbai', 'Delhi', 'Bangalore', 'Goa', 'Chennai'][Math.floor(Math.random() * 5)],
          startDate: bookingDate,
          endDate: checkOut,
          hotelDetails: {
            name: `Hotel ${i + 1}`,
            location: ['Mumbai', 'Delhi', 'Bangalore', 'Goa', 'Chennai'][Math.floor(Math.random() * 5)],
            checkInDate: bookingDate,
            checkOutDate: checkOut,
            nights: Math.ceil((checkOut - bookingDate) / (1000 * 60 * 60 * 24)),
            roomType: 'Deluxe',
            guestDetails: {
              primaryGuest: user.name,
              numberOfGuests: Math.floor(Math.random() * 3) + 1
            }
          }
        }
      });
    }

    // Insert all bookings
    console.log(`📊 Creating ${sampleBookings.length} sample bookings...`);
    await Booking.insertMany(sampleBookings);
    
    // Show summary
    const summary = await Booking.aggregate([
      {
        $group: {
          _id: { type: '$bookingType', status: '$status' },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.type': 1, '_id.status': 1 } }
    ]);

    console.log('\n📈 Booking Summary:');
    summary.forEach(item => {
      console.log(`${item._id.type} (${item._id.status}): ${item.count} bookings, ₹${item.totalAmount.toLocaleString()}`);
    });

    console.log('\n✅ Sample data created successfully!');
    console.log('🎯 Analytics graphs should now display data.');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  }
}

// Run the script
console.log('🚀 Starting sample data generation...');
createSampleData();