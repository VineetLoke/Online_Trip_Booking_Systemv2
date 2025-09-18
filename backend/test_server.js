// Test Server Startup and Admin Login
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: __dirname + '/.env' });

// Import Admin model
const Admin = require('./models/Admin');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Test admin login route
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    console.log('=== ADMIN LOGIN ATTEMPT ===');
    console.log('Request body:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({
        error: { message: 'Email and password are required', status: 400 }
      });
    }
    
    console.log('Looking for admin with email:', email);
    
    // Check if admin exists
    const admin = await Admin.findOne({ email });
    console.log('Admin found:', admin ? 'YES' : 'NO');
    
    if (!admin) {
      console.log('Admin not found');
      return res.status(401).json({
        error: { message: 'Invalid credentials', status: 401 }
      });
    }
    
    console.log('Admin details:', {
      name: admin.name,
      email: admin.email,
      hasPassword: !!admin.passwordHash
    });
    
    if (!admin.passwordHash) {
      console.log('ERROR: Admin has no password hash!');
      return res.status(500).json({
        error: { message: 'Admin account configuration error', status: 500 }
      });
    }
    
    // Check password
    console.log('Comparing password...');
    const isMatch = await admin.comparePassword(password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({
        error: { message: 'Invalid credentials', status: 401 }
      });
    }
    
    console.log('Login successful!');
    
    res.status(200).json({
      message: 'Admin login successful',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      token: 'test-token-123'
    });
    
  } catch (error) {
    console.error('ERROR in admin login:', error);
    console.error('Stack trace:', error.stack);
    
    res.status(500).json({
      error: {
        message: `Server error: ${error.message}`,
        status: 500
      }
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online_booking_system');
    console.log('✅ Connected to MongoDB');
    
    // Check admin exists
    const admin = await Admin.findOne({ email: 'admin@travelease.com' });
    console.log('Admin check:', admin ? '✅ EXISTS' : '❌ NOT FOUND');
    if (admin) {
      console.log('Admin password hash:', admin.passwordHash ? '✅ EXISTS' : '❌ MISSING');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Test server running on http://localhost:${PORT}`);
      console.log('📝 Admin login endpoint: POST /api/auth/admin/login');
      console.log('🔍 Health check: GET /api/health');
    });
    
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
}

startServer();