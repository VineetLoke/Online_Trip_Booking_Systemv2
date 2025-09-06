const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: [0, 'Price cannot be negative']
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    default: 3
  },
  amenities: [{
    type: String,
    trim: true
  }],
  availableRooms: {
    type: Number,
    required: [true, 'Available rooms is required'],
    min: [0, 'Available rooms cannot be negative']
  },
  totalRooms: {
    type: Number,
    required: [true, 'Total rooms is required'],
    min: [1, 'Total rooms must be at least 1']
  },
  roomType: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['Standard', 'Deluxe', 'Suite', 'Ocean View', 'Mountain View'],
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
hotelSchema.index({ location: 1 });
hotelSchema.index({ name: 1, location: 1 });
hotelSchema.index({ status: 1 });
hotelSchema.index({ rating: -1 });

// Validate that available rooms doesn't exceed total rooms
hotelSchema.pre('save', function(next) {
  if (this.availableRooms > this.totalRooms) {
    next(new Error('Available rooms cannot exceed total rooms'));
  }
  next();
});

module.exports = mongoose.model('Hotel', hotelSchema);

