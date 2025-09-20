const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

async function changeAdminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/online_booking_system');
    console.log('Connected to MongoDB');

    // Find the admin user
    const admin = await Admin.findOne({ email: 'admin@travelease.com' });
    
    if (!admin) {
      console.log('Admin not found. Creating a new admin...');
      
      // Create new admin with plain password (will be hashed by pre-save middleware)
      const newPassword = 'admin123';
      
      const newAdmin = new Admin({
        name: 'Admin',
        username: 'admin',
        email: 'admin@travelease.com',
        passwordHash: newPassword, // Will be hashed by pre-save middleware
        role: 'admin',
        permissions: ['manage_users', 'manage_flights', 'manage_trains', 'manage_hotels', 'view_reports']
      });
      
      await newAdmin.save();
      console.log('New admin created successfully!');
      console.log('Email: admin@travelease.com');
      console.log('Username: admin');
      console.log('Password: admin123');
      
      // Test login immediately
      const testAdmin = await Admin.findOne({ email: 'admin@travelease.com' });
      const isMatch = await testAdmin.comparePassword('admin123');
      console.log('Password test result:', isMatch ? 'SUCCESS' : 'FAILED');
      
    } else {
      console.log('Admin found. Updating password...');
      
      // You can change this to your desired password
      const newPassword = 'SecureAdmin2024!'; // Change this to your desired password
      
      // Set plain password (will be hashed by pre-save middleware)
      admin.passwordHash = newPassword;
      await admin.save();
      
      console.log('Admin password updated successfully!');
      console.log('Email: admin@travelease.com');
      console.log('Username: ' + admin.username);
      console.log('New Password: ' + newPassword);
      
      // Test the updated password
      const isMatch = await admin.comparePassword(newPassword);
      console.log('Password test result:', isMatch ? 'SUCCESS' : 'FAILED');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
changeAdminPassword();