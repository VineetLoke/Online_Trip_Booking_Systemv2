const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const Train = require('../models/Train');
const Hotel = require('../models/Hotel');

// Search flights
router.get('/flights', async (req, res) => {
  try {
    const { source, destination, date, airline } = req.query;
    
    // Input validation
    if (source && source.trim().length < 2) {
      return res.status(400).json({
        error: {
          message: 'Source must be at least 2 characters long',
          status: 400
        }
      });
    }
    
    if (destination && destination.trim().length < 2) {
      return res.status(400).json({
        error: {
          message: 'Destination must be at least 2 characters long',
          status: 400
        }
      });
    }
    
    if (date && isNaN(new Date(date).getTime())) {
      return res.status(400).json({
        error: {
          message: 'Invalid date format',
          status: 400
        }
      });
    }
    
    // Build query
    const query = {};
    
    if (source) query.source = new RegExp(source, 'i');
    if (destination) query.destination = new RegExp(destination, 'i');
    if (airline) query.airline = new RegExp(airline, 'i');
    
    // Handle date query with future time filter
    const now = new Date();
    const bufferMinutes = 60; // 60 minutes buffer
    const cutoffTime = new Date(now.getTime() + bufferMinutes * 60 * 1000);
    
    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      // Ensure departure time is in the future with buffer
      query.departureTime = {
        $gte: new Date(Math.max(searchDate.getTime(), cutoffTime.getTime())),
        $lt: nextDay
      };
    } else {
      // If no date specified, only show flights departing after the cutoff time
      query.departureTime = {
        $gt: cutoffTime
      };
    }
    
    // Only show active flights
    query.status = 'active';
    
    // Execute query
    const flights = await Flight.find(query)
      .sort({ departureTime: 1 })
      .limit(50);
    
    res.status(200).json({
      count: flights.length,
      flights
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

// Search trains
router.get('/trains', async (req, res) => {
  try {
    const { source, destination, date, trainName } = req.query;
    
    // Build query
    const query = {};
    
    if (source) query.source = new RegExp(source, 'i');
    if (destination) query.destination = new RegExp(destination, 'i');
    if (trainName) query.trainName = new RegExp(trainName, 'i');
    
    // Handle date query
    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.departureTime = {
        $gte: searchDate,
        $lt: nextDay
      };
    }
    
    // Only show active trains
    query.status = 'active';
    
    // Execute query
    const trains = await Train.find(query)
      .sort({ departureTime: 1 })
      .limit(50);
    
    res.status(200).json({
      count: trains.length,
      trains
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

// Search hotels
router.get('/hotels', async (req, res) => {
  try {
    const { location, checkIn, checkOut, roomType, minRating } = req.query;
    
    // Input validation
    if (location && location.trim().length < 2) {
      return res.status(400).json({
        error: {
          message: 'Location must be at least 2 characters long',
          status: 400
        }
      });
    }
    
    if (checkIn && isNaN(new Date(checkIn).getTime())) {
      return res.status(400).json({
        error: {
          message: 'Invalid check-in date format',
          status: 400
        }
      });
    }
    
    if (checkOut && isNaN(new Date(checkOut).getTime())) {
      return res.status(400).json({
        error: {
          message: 'Invalid check-out date format',
          status: 400
        }
      });
    }
    
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      return res.status(400).json({
        error: {
          message: 'Check-out date must be after check-in date',
          status: 400
        }
      });
    }
    
    if (minRating && (isNaN(minRating) || minRating < 0 || minRating > 5)) {
      return res.status(400).json({
        error: {
          message: 'Minimum rating must be between 0 and 5',
          status: 400
        }
      });
    }
    
    // Build query
    const query = {};
    
    if (location) query.location = new RegExp(location, 'i');
    if (roomType) query.roomType = roomType;
    if (minRating) query.rating = { $gte: parseFloat(minRating) };
    
    // Only show active hotels
    query.status = 'active';
    
    // Execute query
    const hotels = await Hotel.find(query)
      .sort({ rating: -1 })
      .limit(50);
    
    res.status(200).json({
      count: hotels.length,
      hotels
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

// Get flight by ID
router.get('/flights/:id', async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    
    if (!flight) {
      return res.status(404).json({
        error: {
          message: 'Flight not found',
          status: 404
        }
      });
    }
    
    res.status(200).json({ flight });
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

// Get train by ID
router.get('/trains/:id', async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);
    
    if (!train) {
      return res.status(404).json({
        error: {
          message: 'Train not found',
          status: 404
        }
      });
    }
    
    res.status(200).json({ train });
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

// Get hotel by ID
router.get('/hotels/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({
        error: {
          message: 'Hotel not found',
          status: 404
        }
      });
    }
    
    res.status(200).json({ hotel });
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
