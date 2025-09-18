// Manual Admin Login Test - Run this separately
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

async function testAdminLogin() {
  try {
    console.log('🔍 Testing admin login manually...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/online_booking_system');
    console.log('✅ Connected to MongoDB');
    
    // Test credentials
    const email = 'admin@travelease.com';
    const password = 'admin123';
    
    // Find admin
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      console.log('❌ Admin not found');
      process.exit(1);
    }
    
    console.log('✅ Admin found:', {
      name: admin.name,
      email: admin.email,
      hasPassword: !!admin.passwordHash,
      passwordLength: admin.passwordHash ? admin.passwordHash.length : 0
    });
    
    // Test password comparison
    try {
      const isMatch = await bcrypt.compare(password, admin.passwordHash);
      console.log(`🔒 Password test: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
      
      if (isMatch) {
        console.log('🎉 ADMIN LOGIN SHOULD WORK!');
        console.log('Credentials to use:');
        console.log('  Email:', email);
        console.log('  Password:', password);
      } else {
        console.log('❌ Password comparison failed');
      }
      
    } catch (compareError) {
      console.error('❌ bcrypt.compare error:', compareError.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    process.exit(0);
  }
}

testAdminLogin();