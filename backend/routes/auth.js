const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { authenticateUser, authenticateAdmin, rateLimitAuth, recordFailedAuth, clearAuthAttempts } = require('../middleware/auth');
const eventBus = require('../utils/eventBus');

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Input validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        error: {
          message: 'Name must be at least 2 characters long',
          status: 400
        }
      });
    }
    
    if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res.status(400).json({
        error: {
          message: 'Please provide a valid email address',
          status: 400
        }
      });
    }
    
    if (!phone || !/^\+?[\d\s-()]+$/.test(phone)) {
      return res.status(400).json({
        error: {
          message: 'Please provide a valid phone number',
          status: 400
        }
      });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({
        error: {
          message: 'Password must be at least 6 characters long',
          status: 400
        }
      });
    }
    
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

    // Emit real-time event for admin logs
    eventBus.emit('user:registered', {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: "Internal server error",
        status: 500,
        details: error.message
      }
    });
  }
});

// User Login
router.post('/login', rateLimitAuth, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res.status(400).json({
        error: {
          message: 'Please provide a valid email address',
          status: 400
        }
      });
    }
    
    if (!password || password.trim().length === 0) {
      return res.status(400).json({
        error: {
          message: 'Password is required',
          status: 400
        }
      });
    }
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      recordFailedAuth(req);
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
      recordFailedAuth(req);
      return res.status(401).json({
        error: {
          message: 'Invalid credentials',
          status: 401
        }
      });
    }
    
    // Clear failed attempts on successful login
    clearAuthAttempts(req);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: "Internal server error",
        status: 500,
        details: error.message
      }
    });
  }
});

// Admin Login
router.post('/admin/login', rateLimitAuth, async (req, res) => {
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
        message: "Internal server error",
        status: 500,
        details: error.message
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
        message: "Internal server error",
        status: 500,
        details: error.message
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
        message: "Internal server error",
        status: 500,
        details: error.message
      }
    });
  }
});

// Admin token validation endpoint
router.get('/admin/me', authenticateAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

module.exports = router;

