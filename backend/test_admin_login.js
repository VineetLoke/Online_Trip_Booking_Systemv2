// Test Admin Login - Diagnostic Script
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import Admin model
const Admin = require('./models/Admin');

async function testAdminLogin() {
  try {
    console.log('🔍 Testing admin login functionality...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online_booking_system');
    console.log('✅ Connected to MongoDB');
    
    // Check if admin exists
    const adminEmail = 'admin@travelease.com';
    const adminPassword = 'admin123';
    
    console.log(`🔍 Looking for admin with email: ${adminEmail}`);
    const admin = await Admin.findOne({ email: adminEmail });
    
    if (!admin) {
      console.log('❌ Admin not found');
      console.log('🔧 Creating admin account...');
      
      // Create admin if doesn't exist
      const newAdmin = new Admin({
        name: 'Admin User',
        username: 'admin',
        email: adminEmail,
        passwordHash: adminPassword, // Will be hashed by pre-save hook
        role: 'admin',
        permissions: ['manage_users', 'manage_flights', 'manage_trains', 'manage_hotels', 'view_reports']
      });
      
      await newAdmin.save();
      console.log('✅ Admin account created successfully');
      
      // Test the new admin
      const testAdmin = await Admin.findOne({ email: adminEmail });
      const isMatch = await testAdmin.comparePassword(adminPassword);
      console.log(`🔒 Password verification: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
      
    } else {
      console.log('✅ Admin found');
      console.log('📋 Admin details:', {
        name: admin.name,
        email: admin.email,
        role: admin.role
      });
      
      // Test password comparison
      const isMatch = await admin.comparePassword(adminPassword);
      console.log(`🔒 Password verification: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
      
      if (!isMatch) {
        console.log('🔧 Updating admin password...');
        admin.passwordHash = adminPassword;
        await admin.save();
        console.log('✅ Password updated');
        
        // Test again
        const updatedAdmin = await Admin.findOne({ email: adminEmail });
        const newMatch = await updatedAdmin.comparePassword(adminPassword);
        console.log(`🔒 Password verification after update: ${newMatch ? 'SUCCESS' : 'FAILED'}`);
      }
    }
    
    console.log('✅ Admin login test completed');
    
  } catch (error) {
    console.error('❌ Error during admin login test:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
    process.exit(0);
  }
}

testAdminLogin();