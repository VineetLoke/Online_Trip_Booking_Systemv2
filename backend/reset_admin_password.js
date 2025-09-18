// Usage: node reset_admin_password.js <admin_email> <new_password>
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

if (process.argv.length !== 4) {
  console.log('Usage: node reset_admin_password.js <admin_email> <new_password>');
  process.exit(1);
}

const [email, newPassword] = process.argv.slice(2);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online_booking_system');
  const hash = await bcrypt.hash(newPassword, 10);
  const result = await Admin.updateOne(
    { email },
    { $set: { passwordHash: hash } }
  );
  if (result.matchedCount === 0) {
    console.log('No admin found with that email.');
  } else {
    console.log('Admin password updated successfully.');
  }
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
