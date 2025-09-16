const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticateAdmin, checkPermission } = require('../middleware/auth');
const User = require('../models/User');
const Flight = require('../models/Flight');
const Train = require('../models/Train');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');

// Get all users
router.get('/users', authenticateAdmin, checkPermission('manage_users'), async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    
    res.status(200).json({
      count: users.length,
      users
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

// Get user by ID
router.get('/users/:id', authenticateAdmin, checkPermission('manage_users'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          status: 404
        }
      });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
        status: 500
      }
    });
  }
});

// Get user's bookings
router.get('/users/:id/bookings', authenticateAdmin, checkPermission('manage_users'), async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.id })
      .sort({ bookingDate: -1 });
    
    res.status(200).json({
      count: bookings.length,
      bookings
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

// Get all flights
router.get('/flights', authenticateAdmin, checkPermission('manage_flights'), async (req, res) => {
  try {
    const flights = await Flight.find().sort({ departureTime: 1 });
    
    res.status(200).json({
      count: flights.length,
      flights
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

// Manage flights
router.post('/flights', authenticateAdmin, checkPermission('manage_flights'), async (req, res) => {
  try {
    const flight = new Flight(req.body);
    await flight.save();
    
    res.status(201).json({
      message: 'Flight created successfully',
      flight
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

router.put('/flights/:id', authenticateAdmin, checkPermission('manage_flights'), async (req, res) => {
  try {
    const flight = await Flight.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!flight) {
      return res.status(404).json({
        error: {
          message: 'Flight not found',
          status: 404
        }
      });
    }
    
    res.status(200).json({
      message: 'Flight updated successfully',
      flight
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

router.delete('/flights/:id', authenticateAdmin, checkPermission('manage_flights'), async (req, res) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);
    
    if (!flight) {
      return res.status(404).json({
        error: {
          message: 'Flight not found',
          status: 404
        }
      });
    }
    
    res.status(200).json({
      message: 'Flight deleted successfully'
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

// Get all trains
router.get('/trains', authenticateAdmin, checkPermission('manage_trains'), async (req, res) => {
  try {
    const trains = await Train.find().sort({ departureTime: 1 });
    
    res.status(200).json({
      count: trains.length,
      trains
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

// Manage trains
router.post('/trains', authenticateAdmin, checkPermission('manage_trains'), async (req, res) => {
  try {
    const train = new Train(req.body);
    await train.save();
    
    res.status(201).json({
      message: 'Train created successfully',
      train
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

router.put('/trains/:id', authenticateAdmin, checkPermission('manage_trains'), async (req, res) => {
  try {
    const train = await Train.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!train) {
      return res.status(404).json({
        error: {
          message: 'Train not found',
          status: 404
        }
      });
    }
    
    res.status(200).json({
      message: 'Train updated successfully',
      train
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

router.delete('/trains/:id', authenticateAdmin, checkPermission('manage_trains'), async (req, res) => {
  try {
    const train = await Train.findByIdAndDelete(req.params.id);
    
    if (!train) {
      return res.status(404).json({
        error: {
          message: 'Train not found',
          status: 404
        }
      });
    }
    
    res.status(200).json({
      message: 'Train deleted successfully'
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

// Get all hotels
router.get('/hotels', authenticateAdmin, checkPermission('manage_hotels'), async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ name: 1 });
    
    res.status(200).json({
      count: hotels.length,
      hotels
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

// Manage hotels
router.post('/hotels', authenticateAdmin, checkPermission('manage_hotels'), async (req, res) => {
  try {
    const hotel = new Hotel(req.body);
    await hotel.save();
    
    res.status(201).json({
      message: 'Hotel created successfully',
      hotel
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

router.put('/hotels/:id', authenticateAdmin, checkPermission('manage_hotels'), async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!hotel) {
      return res.status(404).json({
        error: {
          message: 'Hotel not found',
          status: 404
        }
      });
    }
    
    res.status(200).json({
      message: 'Hotel updated successfully',
      hotel
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

router.delete('/hotels/:id', authenticateAdmin, checkPermission('manage_hotels'), async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({
        error: {
          message: 'Hotel not found',
          status: 404
        }
      });
    }
    
    res.status(200).json({
      message: 'Hotel deleted successfully'
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

// Get all bookings
router.get('/bookings', authenticateAdmin, checkPermission('view_reports'), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .sort({ bookingDate: -1 });
    
    res.status(200).json({
      count: bookings.length,
      bookings
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

// Get booking details with all related passengers for the same trip
router.get('/bookings/:id/details', authenticateAdmin, checkPermission('view_reports'), async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    // Get the main booking
    const mainBooking = await Booking.findById(bookingId)
      .populate('userId', 'name email phone');
    
    if (!mainBooking) {
      return res.status(404).json({
        error: {
          message: 'Booking not found',
          status: 404
        }
      });
    }
    
    // Find all related bookings for the same trip
    let relatedBookings = [];
    
    if (mainBooking.bookingType === 'flight' && mainBooking.trip?.flightDetails) {
      // Find all bookings for the same flight, same departure time, booked around the same time
      const timeWindow = 5 * 60 * 1000; // 5 minutes
      relatedBookings = await Booking.find({
        bookingType: 'flight',
        'trip.flightDetails.flightNumber': mainBooking.trip.flightDetails.flightNumber,
        'trip.flightDetails.departureTime': mainBooking.trip.flightDetails.departureTime,
        bookingDate: {
          $gte: new Date(mainBooking.bookingDate.getTime() - timeWindow),
          $lte: new Date(mainBooking.bookingDate.getTime() + timeWindow)
        }
      }).populate('userId', 'name email phone');
    } else if (mainBooking.bookingType === 'train' && mainBooking.trip?.trainDetails) {
      // Find all bookings for the same train, same departure time, booked around the same time
      const timeWindow = 5 * 60 * 1000; // 5 minutes
      relatedBookings = await Booking.find({
        bookingType: 'train',
        'trip.trainDetails.trainNumber': mainBooking.trip.trainDetails.trainNumber,
        'trip.trainDetails.departureTime': mainBooking.trip.trainDetails.departureTime,
        bookingDate: {
          $gte: new Date(mainBooking.bookingDate.getTime() - timeWindow),
          $lte: new Date(mainBooking.bookingDate.getTime() + timeWindow)
        }
      }).populate('userId', 'name email phone');
    } else if (mainBooking.bookingType === 'hotel' && mainBooking.trip?.hotelDetails) {
      // Find all bookings for the same hotel, same dates, booked around the same time
      const timeWindow = 5 * 60 * 1000; // 5 minutes
      relatedBookings = await Booking.find({
        bookingType: 'hotel',
        'trip.hotelDetails.hotelId': mainBooking.trip.hotelDetails.hotelId,
        'trip.hotelDetails.checkInDate': mainBooking.trip.hotelDetails.checkInDate,
        'trip.hotelDetails.checkOutDate': mainBooking.trip.hotelDetails.checkOutDate,
        bookingDate: {
          $gte: new Date(mainBooking.bookingDate.getTime() - timeWindow),
          $lte: new Date(mainBooking.bookingDate.getTime() + timeWindow)
        }
      }).populate('userId', 'name email phone');
    } else {
      // If no trip details, just return the main booking
      relatedBookings = [mainBooking];
    }
    
    // If no related bookings found, return just the main booking
    if (relatedBookings.length === 0) {
      relatedBookings = [mainBooking];
    }
    
    // Calculate total amount and passenger count
    const totalAmount = relatedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const passengerCount = relatedBookings.length;
    
    res.status(200).json({
      mainBooking,
      relatedBookings,
      isGroupBooking: relatedBookings.length > 1,
      passengerCount,
      totalAmount
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

// Get analytics data
router.get('/analytics/overview', authenticateAdmin, checkPermission('view_reports'), async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    
    // Get today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayBookings = await Booking.countDocuments({
      bookingDate: { $gte: today, $lt: tomorrow }
    });
    
    // Calculate total revenue
    const revenueResult = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    
    res.json({
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      todayBookings,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({
      error: { message: error.message, status: 500 }
    });
  }
});

// Get booking types distribution
router.get('/analytics/booking-types', authenticateAdmin, checkPermission('view_reports'), async (req, res) => {
  try {
    const bookingTypes = await Booking.aggregate([
      { $group: { _id: '$bookingType', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({ bookingTypes });
  } catch (error) {
    res.status(500).json({
      error: { message: error.message, status: 500 }
    });
  }
});

// Get booking status distribution
router.get('/analytics/booking-status', authenticateAdmin, checkPermission('view_reports'), async (req, res) => {
  try {
    const bookingStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({ bookingStatus });
  } catch (error) {
    res.status(500).json({
      error: { message: error.message, status: 500 }
    });
  }
});

// Get popular flight routes
router.get('/analytics/flight-routes', authenticateAdmin, checkPermission('view_reports'), async (req, res) => {
  try {
    const flightRoutes = await Booking.aggregate([
      { $match: { bookingType: 'flight' } },
      { $group: {
          _id: {
            route: { $concat: ['$trip.flightDetails.source', ' → ', '$trip.flightDetails.destination'] }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({ flightRoutes });
  } catch (error) {
    res.status(500).json({
      error: { message: error.message, status: 500 }
    });
  }
});

// Get popular train routes
router.get('/analytics/train-routes', authenticateAdmin, checkPermission('view_reports'), async (req, res) => {
  try {
    const trainRoutes = await Booking.aggregate([
      { $match: { bookingType: 'train' } },
      { $group: {
          _id: {
            route: { $concat: ['$trip.trainDetails.source', ' → ', '$trip.trainDetails.destination'] }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({ trainRoutes });
  } catch (error) {
    res.status(500).json({
      error: { message: error.message, status: 500 }
    });
  }
});

// Get hotel bookings by location
router.get('/analytics/hotel-locations', authenticateAdmin, checkPermission('view_reports'), async (req, res) => {
  try {
    const hotelLocations = await Booking.aggregate([
      { $match: { bookingType: 'hotel' } },
      { $group: {
          _id: '$trip.hotelDetails.location',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({ hotelLocations });
  } catch (error) {
    res.status(500).json({
      error: { message: error.message, status: 500 }
    });
  }
});

// Get monthly revenue trend
router.get('/analytics/monthly-revenue', authenticateAdmin, checkPermission('view_reports'), async (req, res) => {
  try {
    const monthlyRevenue = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: {
          _id: {
            year: { $year: '$bookingDate' },
            month: { $month: '$bookingDate' }
          },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);
    
    res.json({ monthlyRevenue });
  } catch (error) {
    res.status(500).json({
      error: { message: error.message, status: 500 }
    });
  }
});

// Get booking statistics (legacy endpoint)
router.get('/reports/bookings', authenticateAdmin, checkPermission('view_reports'), async (req, res) => {
  try {
    // Aggregate bookings by type and status
    const bookingStats = await Booking.aggregate([
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
        message: error.message,
        status: 500
      }
    });
  }
});

module.exports = router;

