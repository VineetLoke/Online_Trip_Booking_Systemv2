const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const Train = require('../models/Train');
const Hotel = require('../models/Hotel');

// Search flights
router.get('/flights', async (req, res) => {
  try {
    const { source, destination, date, airline } = req.query;
    
    // Build query
    const query = {};
    
    if (source) query.source = new RegExp(source, 'i');
    if (destination) query.destination = new RegExp(destination, 'i');
    if (airline) query.airline = new RegExp(airline, 'i');
    
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
        message: error.message,
        status: 500
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
        message: error.message,
        status: 500
      }
    });
  }
});

// Search hotels
router.get('/hotels', async (req, res) => {
  try {
    const { location, checkIn, checkOut, roomType, minRating } = req.query;
    
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
        message: error.message,
        status: 500
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
        message: error.message,
        status: 500
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
        message: error.message,
        status: 500
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
        message: error.message,
        status: 500
      }
    });
  }
});

module.exports = router;

