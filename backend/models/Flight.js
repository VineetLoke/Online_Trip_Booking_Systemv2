const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightNumber: {
    type: String,
    required: [true, 'Flight number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  airline: {
    type: String,
    required: [true, 'Airline is required'],
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
        // Allow 5 minutes buffer for near-future flights and data entry
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
  aircraft: {
    type: String,
    required: [true, 'Aircraft type is required'],
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
flightSchema.index({ source: 1, destination: 1, departureTime: 1 });
flightSchema.index({ flightNumber: 1 });
flightSchema.index({ status: 1 });

// Validate that available seats doesn't exceed total seats
flightSchema.pre('save', function(next) {
  if (this.availableSeats > this.totalSeats) {
    next(new Error('Available seats cannot exceed total seats'));
  }
  next();
});

module.exports = mongoose.model('Flight', flightSchema);

