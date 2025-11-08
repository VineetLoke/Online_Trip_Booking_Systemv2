// Quick script to check and create admin account
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function checkAndCreateAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online_booking_system');
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    let admin = await Admin.findOne({ email: process.env.ADMIN_EMAIL || 'admin@travelease.com' });
    
    if (admin) {
      console.log('✅ Admin account found!');
      console.log('   Email:', admin.email);
      console.log('   Name:', admin.name);
      console.log('   Role:', admin.role);
      console.log('\n🔑 You can login with:');
      console.log('   Email: admin@travelease.com');
      console.log('   Password: TravelEase2025@SecureAdmin!');
    } else {
      console.log('❌ Admin account NOT found. Creating one...');
      
      // Create admin account
      admin = new Admin({
        name: 'System Administrator',
        email: process.env.ADMIN_EMAIL || 'admin@travelease.com',
        passwordHash: process.env.ADMIN_PASSWORD || 'TravelEase2025@SecureAdmin!',
        role: 'super_admin',
        permissions: [
          'manage_users',
          'manage_bookings',
          'manage_flights',
          'manage_trains',
          'manage_hotels',
          'view_analytics',
          'manage_admins'
        ]
      });
      
      await admin.save();
      console.log('✅ Admin account created successfully!');
      console.log('\n🔑 Login credentials:');
      console.log('   Email: admin@travelease.com');
      console.log('   Password: TravelEase2025@SecureAdmin!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
  }
}

checkAndCreateAdmin();
