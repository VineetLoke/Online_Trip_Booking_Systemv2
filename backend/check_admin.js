const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

async function checkAndCreateAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online_booking_system');
    console.log('Connected to MongoDB');

    // Check if any admin exists
    const adminCount = await Admin.countDocuments();
    console.log(`Number of admins in database: ${adminCount}`);

    if (adminCount === 0) {
      console.log('No admin found. Creating default admin...');
      
      // Create default admin
      const defaultAdmin = new Admin({
        name: 'System Administrator',
        username: 'admin',
        email: 'admin@travelease.com',
        passwordHash: 'admin123', // Will be hashed by the pre-save middleware
        role: 'super_admin',
        permissions: ['manage_users', 'manage_flights', 'manage_trains', 'manage_hotels', 'view_reports']
      });

      await defaultAdmin.save();
      console.log('✅ Default admin created successfully!');
      console.log('Email: admin@travelease.com');
      console.log('Password: admin123');
    } else {
      // List existing admins
      const admins = await Admin.find({}, 'name username email role');
      console.log('Existing admins:');
      admins.forEach(admin => {
        console.log(`- ${admin.name} (${admin.email}) - Role: ${admin.role}`);
      });
    }

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAndCreateAdmin();