const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Admin = require('./models/Admin');

async function resetAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = process.env.ADMIN_EMAIL || 'admin@travelease.com';
    const password = process.env.ADMIN_PASSWORD || 'TravelEase2025@SecureAdmin!';

    console.log('\n🔍 Looking for admin:', email);

    // Find admin
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      console.log('\n❌ Admin not found. Creating new admin...');
      
      // Create new admin with proper password hashing
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const newAdmin = new Admin({
        name: 'System Administrator',
        username: 'admin',
        email: email,
        passwordHash: hashedPassword,
        role: 'super_admin',
        permissions: [
          'manage_users',
          'manage_flights',
          'manage_trains',
          'manage_hotels',
          'view_reports'
        ]
      });

      // Save without triggering the pre-save hook
      await newAdmin.save({ validateBeforeSave: true });
      console.log('✅ New admin created successfully!');
    } else {
      console.log('✅ Admin found:', {
        id: admin._id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
        role: admin.role
      });

      // Reset password directly (bypass pre-save hook to avoid double hashing)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      await Admin.updateOne(
        { email },
        { $set: { passwordHash: hashedPassword } }
      );
      
      console.log('\n✅ Password reset successfully!');
    }

    // Test the password
    console.log('\n🔐 Testing password...');
    const testAdmin = await Admin.findOne({ email });
    const isMatch = await bcrypt.compare(password, testAdmin.passwordHash);
    
    if (isMatch) {
      console.log('✅ Password verification SUCCESSFUL!');
      console.log('\n📋 Login Credentials:');
      console.log('   Email:', email);
      console.log('   Password:', password);
      console.log('\n🌐 Login at: http://localhost:8000/pages/admin/login.html');
    } else {
      console.log('❌ Password verification FAILED!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

resetAdminPassword();
