const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function deleteAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/online_booking_system');
    console.log('Connected to MongoDB');

    const result = await Admin.deleteMany({ email: 'admin@travelease.com' });
    console.log('Deleted admins:', result.deletedCount);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

deleteAdmin();