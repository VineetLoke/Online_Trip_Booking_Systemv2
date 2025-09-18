// Fix Admin Password - Set proper password hash
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import Admin model
const Admin = require('./models/Admin');

async function fixAdminPassword() {
  try {
    console.log('🔧 Fixing admin password...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online_booking_system');
    console.log('✅ Connected to MongoDB');
    
    // Find admin
    const admin = await Admin.findOne({ email: 'admin@travelease.com' });
    
    if (!admin) {
      console.log('❌ Admin not found, creating new one...');
      
      const newAdmin = new Admin({
        name: 'Admin User',
        username: 'admin',
        email: 'admin@travelease.com',
        passwordHash: 'admin123', // Will be hashed by pre-save hook
        role: 'admin',
        permissions: ['manage_users', 'manage_flights', 'manage_trains', 'manage_hotels', 'view_reports']
      });
      
      await newAdmin.save();
      console.log('✅ New admin created with proper password');
      
    } else {
      console.log('🔧 Updating existing admin password...');
      console.log('Current passwordHash:', admin.passwordHash ? 'EXISTS' : 'UNDEFINED');
      
      // Manually hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Update admin directly in database
      await Admin.findByIdAndUpdate(admin._id, {
        passwordHash: hashedPassword
      });
      
      console.log('✅ Admin password updated with proper hash');
    }
    
    // Test the login
    console.log('🧪 Testing login...');
    const testAdmin = await Admin.findOne({ email: 'admin@travelease.com' });
    
    if (testAdmin.passwordHash) {
      const isMatch = await bcrypt.compare('admin123', testAdmin.passwordHash);
      console.log(`🔒 Login test: ${isMatch ? 'SUCCESS ✅' : 'FAILED ❌'}`);
    } else {
      console.log('❌ Password hash is still undefined');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
    process.exit(0);
  }
}

fixAdminPassword();