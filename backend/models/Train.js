const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema({
  trainNumber: {
    type: String,
    required: [true, 'Train number is required'],
    unique: true,
    trim: true
  },
  trainName: {
    type: String,
    required: [true, 'Train name is required'],
    trim: true
  },
  source: {
    type: String,
    required: [true, 'Source is required'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  departureTime: {
    type: Date,
    required: [true, 'Departure time is required'],
    validate: {
      validator: function(value) {
        // Allow 5 minutes buffer for near-future trains and data entry
        const bufferMinutes = 5;
        const minimumTime = new Date(Date.now() - (bufferMinutes * 60 * 1000));
        return value > minimumTime;
      },
      message: 'Departure time cannot be more than 5 minutes in the past'
    }
  },
  arrivalTime: {
    type: Date,
    required: [true, 'Arrival time is required'],
    validate: {
      validator: function(value) {
        return value > this.departureTime;
      },
      message: 'Arrival time must be after departure time'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  availableSeats: {
    type: Number,
    required: [true, 'Available seats is required'],
    min: [0, 'Available seats cannot be negative']
  },
  totalSeats: {
    type: Number,
    required: [true, 'Total seats is required'],
    min: [1, 'Total seats must be at least 1']
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    enum: ['Sleeper', 'AC 3-Tier', 'AC 2-Tier', 'AC 1-Tier', 'Chair Car'],
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'delayed'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
trainSchema.index({ source: 1, destination: 1, departureTime: 1 });
trainSchema.index({ trainNumber: 1 });
trainSchema.index({ status: 1 });

// Validate that available seats doesn't exceed total seats
trainSchema.pre('save', function(next) {
  if (this.availableSeats > this.totalSeats) {
    next(new Error('Available seats cannot exceed total seats'));
  }
  next();
});

module.exports = mongoose.model('Train', trainSchema);

