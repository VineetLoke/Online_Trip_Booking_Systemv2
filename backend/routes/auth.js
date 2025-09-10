const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { authenticateUser } = require('../middleware/auth');

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: {
          message: 'User with this email already exists',
          status: 400
        }
      });
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      phone,
      passwordHash: password // Will be hashed by pre-save hook
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
        status: 500
      }
    });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Invalid credentials',
          status: 401
        }
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: {
          message: 'Invalid credentials',
          status: 401
        }
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
        status: 500
      }
    });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        error: {
          message: 'Invalid credentials',
          status: 401
        }
      });
    }
    
    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: {
          message: 'Invalid credentials',
          status: 401
        }
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(200).json({
      message: 'Admin login successful',
      admin: {
        id: admin._id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
        status: 500
      }
    });
  }
});

// Get current user
router.get('/me', authenticateUser, async (req, res) => {
  try {
    res.status(200).json({
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
        status: 500
      }
    });
  }
});

// Change password
router.put('/change-password', authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Check current password
    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        error: {
          message: 'Current password is incorrect',
          status: 401
        }
      });
    }
    
    // Update password
    req.user.passwordHash = newPassword;
    await req.user.save();
    
    res.status(200).json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
        status: 500
      }
    });
  }
});

module.exports = router;

