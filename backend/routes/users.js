const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticateUser } = require('../middleware/auth');
const User = require('../models/User');
const Booking = require('../models/Booking');

// Get user profile
router.get('/profile', authenticateUser, async (req, res) => {
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

// Update user profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    // Update user
    if (name) req.user.name = name;
    if (phone) req.user.phone = phone;
    
    await req.user.save();
    
    res.status(200).json({
      message: 'Profile updated successfully',
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

// Get user's booking statistics
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Aggregate bookings by type and status
    const bookingStats = await Booking.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: {
          _id: {
            type: '$bookingType',
            status: '$status'
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.type': 1, '_id.status': 1 } }
    ]);
    
    // Format the results
    const stats = {
      totalBookings: 0,
      totalAmount: 0,
      byType: {},
      byStatus: {}
    };
    
    bookingStats.forEach(stat => {
      const { type, status } = stat._id;
      const { count, totalAmount } = stat;
      
      // Update total counts
      stats.totalBookings += count;
      stats.totalAmount += totalAmount;
      
      // Update by type
      if (!stats.byType[type]) {
        stats.byType[type] = { count: 0, totalAmount: 0 };
      }
      stats.byType[type].count += count;
      stats.byType[type].totalAmount += totalAmount;
      
      // Update by status
      if (!stats.byStatus[status]) {
        stats.byStatus[status] = { count: 0, totalAmount: 0 };
      }
      stats.byStatus[status].count += count;
      stats.byStatus[status].totalAmount += totalAmount;
    });
    
    res.status(200).json({ stats });
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

module.exports = router;

