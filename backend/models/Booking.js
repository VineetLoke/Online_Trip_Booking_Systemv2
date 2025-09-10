const mongoose = require('mongoose');

// Passenger/Guest Schema
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be negative']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  idType: {
    type: String,
    enum: ['Passport', 'Driving License', 'Aadhar', 'Voter ID', 'Other']
  },
  idNumber: {
    type: String,
    trim: true
  }
}, { _id: false });

// Flight Details Schema

const flightDetailsSchema = new mongoose.Schema({
  flightId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: true
  },
  flightNumber: {
    type: String,
    required: true,
    trim: true
  },
  airline: {
    type: String,
    required: true,
    trim: true
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  departureTime: {
    type: Date,
    required: true
  },
  arrivalTime: {
    type: Date,
    required: true
  },
  seatNumber: {
    type: String,
    trim: true
  },
  passengerDetails: personSchema
}, { _id: false }); 

// Train Details Schema
const trainDetailsSchema = new mongoose.Schema({
  trainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Train',
    required: true
  },
  trainNumber: {
    type: String,
    required: true,
    trim: true
  },
  trainName: {
    type: String,
    required: true,
    trim: true
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  departureTime: {
    type: Date,
    required: true
  },
  arrivalTime: {
    type: Date,
    required: true
  },
  seatNumber: {
    type: String,
    trim: true
  },
  class: {
    type: String,
    required: true,
    trim: true
  },
  passengerDetails: personSchema
}, { _id: false });

// Hotel Details Schema
const hotelDetailsSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  nights: {
    type: Number,
    required: true,
    min: [1, 'Nights must be at least 1']
  },
  roomNumber: {
    type: String,
    trim: true
  },
  roomType: {
    type: String,
    required: true,
    trim: true
  },
  guestDetails: {
    primaryGuest: {
      type: String,
      required: true,
      trim: true
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: [1, 'Number of guests must be at least 1']
    },
    specialRequests: {
      type: String,
      trim: true
    }
  }
}, { _id: false });

// Trip Schema
const tripSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['flight', 'train', 'hotel', 'multi'],
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  flightDetails: flightDetailsSchema,
  trainDetails: trainDetailsSchema,
  hotelDetails: hotelDetailsSchema
}, { _id: false });

// Main Booking Schema
const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingType: {
    type: String,
    required: true,
    enum: ['flight', 'train', 'hotel', 'multi'],
    trim: true
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'failed'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    trim: true
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  cancelledAt: {
    type: Date
  },
  trip: tripSchema
}, {
  timestamps: true
});

// Indexes for faster queries
bookingSchema.index({ userId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ 'trip.type': 1 });

module.exports = mongoose.model('Booking', bookingSchema);

