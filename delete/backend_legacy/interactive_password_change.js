const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function changePassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/online_booking_system');
    console.log('Connected to MongoDB');

    // List all admins
    const admins = await Admin.find({}, 'name username email');
    
    if (admins.length === 0) {
      console.log('No admin users found in the database.');
      return;
    }

    console.log('\nFound admin users:');
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.username}) - ${admin.email}`);
    });

    rl.question('\nEnter the number of admin to update password (or press Enter for first admin): ', async (answer) => {
      const selectedIndex = answer.trim() === '' ? 0 : parseInt(answer) - 1;
      
      if (selectedIndex < 0 || selectedIndex >= admins.length) {
        console.log('Invalid selection.');
        await mongoose.disconnect();
        rl.close();
        return;
      }

      const selectedAdmin = admins[selectedIndex];
      
      rl.question(`\nEnter new password for ${selectedAdmin.username}: `, async (newPassword) => {
        if (newPassword.length < 6) {
          console.log('Password must be at least 6 characters long.');
          await mongoose.disconnect();
          rl.close();
          return;
        }

        try {
          const admin = await Admin.findById(selectedAdmin._id);
          admin.passwordHash = newPassword; // Will be hashed by pre-save middleware
          await admin.save();

          console.log(`\n✅ Password updated successfully for ${admin.username}!`);
          console.log(`📧 Email: ${admin.email}`);
          console.log(`👤 Username: ${admin.username}`);
          console.log(`🔐 New Password: ${newPassword}`);

          // Test the password
          const isMatch = await admin.comparePassword(newPassword);
          console.log(`🧪 Password test: ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}`);

        } catch (error) {
          console.error('❌ Error updating password:', error.message);
        } finally {
          await mongoose.disconnect();
          rl.close();
          console.log('\nDisconnected from MongoDB');
        }
      });
    });

  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    rl.close();
  }
}

changePassword();