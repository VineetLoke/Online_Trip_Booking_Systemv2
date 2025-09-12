# Data Management System - Online Booking System

## Overview

The unified data management system combines all database operations into a single, robust script that handles:
- Database setup and initialization
- Data generation (flights, trains, hotels, bookings)
- Database clearing and reset
- Environment configuration
- Error handling and validation

## Problems Fixed

### ❌ Previous Issues:
1. **Environment Configuration Issues** - Inconsistent database connections
2. **Code Duplication** - Repeated connection logic across files
3. **Schema Mismatches** - Data not matching Mongoose models
4. **Performance Issues** - Inefficient data generation
5. **Error Handling** - Poor error messages and no validation
6. **Memory Issues** - Large data generation without batching

### ✅ Solutions Implemented:
1. **Unified Connection Management** - Single connection handler
2. **Environment Configuration** - Proper .env support
3. **Schema Validation** - Data matches Mongoose models
4. **Batch Processing** - Efficient large data insertions
5. **Comprehensive Error Handling** - Detailed error messages
6. **CLI Interface** - Easy-to-use command line interface

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
MONGODB_URI=mongodb://localhost:27017/online_booking_system
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# or
brew services start mongodb-community
```

## Usage

### Complete Setup (Recommended for first time)

```bash
node data_manager.js --action=setup
```

This will:
- Create all collections and indexes
- Generate 1 week of sample data
- Create sample users
- Generate 20 sample bookings
- Create admin user (admin@travelease.com / admin123)

### Generate Data

```bash
# Generate all data types for 30 days
node data_manager.js --action=generate

# Generate only flights for 7 days
node data_manager.js --action=generate --type=flights --days=7

# Generate trains and hotels for 14 days
node data_manager.js --action=generate --type=trains --days=14
node data_manager.js --action=generate --type=hotels
```

### Add Sample Data

```bash
# Add sample users and 50 bookings
node data_manager.js --action=add-sample

# Add sample users and 100 bookings
node data_manager.js --action=add-sample --count=100
```

### Clear Database

```bash
# Clear all data (with confirmation)
node data_manager.js --action=clear
```

### View Statistics

```bash
node data_manager.js --action=stats
```

## Data Generation Details

### Flights
- **2-4 flights per day** across different routes
- **Realistic pricing** based on airline and route
- **Proper timing** with realistic flight durations
- **Seat availability** with random occupancy

### Trains
- **1-3 trains per day** with different classes
- **Overnight journeys** for long distances
- **Realistic pricing** based on class and route
- **Seat availability** with random occupancy

### Hotels
- **Multiple hotels per city** with different amenities
- **Realistic pricing** based on location and type
- **Room availability** with random occupancy
- **Proper amenities** and ratings

### Bookings
- **Realistic booking data** with proper relationships
- **Various statuses** (confirmed, pending, cancelled)
- **Proper payment status** correlation
- **Date ranges** spanning past 6 months

## Data Templates

### Flight Templates
- Air India (Boeing 737) - ₹4,500 base
- IndiGo (Airbus A320) - ₹3,800 base
- SpiceJet (Boeing 737) - ₹4,200 base
- Vistara (Airbus A320) - ₹5,000 base
- GoAir (Airbus A320) - ₹3,600 base

### Train Templates
- Rajdhani Express (AC 2-Tier) - ₹2,500 base
- Shatabdi Express (AC Chair Car) - ₹1,800 base
- Karnataka Express (AC 3-Tier) - ₹2,000 base
- Tamil Nadu Express (AC 3-Tier) - ₹2,200 base
- Goa Express (AC 2-Tier) - ₹2,400 base

### Hotel Templates
- Grand Hotel (Deluxe) - ₹3,500 base
- Palace Hotel (Suite) - ₹4,200 base
- Beach Resort (Ocean View) - ₹5,500 base
- Garden Hotel (Executive) - ₹3,800 base
- City Center (Standard) - ₹3,200 base

## Routes Covered

- Delhi ↔ Mumbai (2.5 hours)
- Mumbai ↔ Bangalore (1.5 hours)
- Delhi ↔ Goa (2.5 hours)
- Bangalore ↔ Chennai (1 hour)
- Delhi ↔ Chennai (3 hours)
- Goa ↔ Mumbai (1.5 hours)

## Performance Features

### Batch Processing
- Large data insertions are processed in batches of 1000 records
- Prevents memory issues and improves performance
- Progress indicators for long operations

### Error Handling
- Comprehensive error messages
- Graceful failure handling
- Database connection validation
- Data validation before insertion

### Memory Management
- Efficient data generation algorithms
- Proper connection cleanup
- Batch processing for large datasets

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```
   Solution: Ensure MongoDB is running and accessible
   Check: mongodb://localhost:27017
   ```

2. **Environment Variables Not Found**
   ```
   Solution: Create .env file from env.example
   Check: All required variables are set
   ```

3. **Schema Validation Errors**
   ```
   Solution: Use the unified data manager
   Check: Data matches Mongoose models
   ```

4. **Memory Issues with Large Data**
   ```
   Solution: Use batch processing (already implemented)
   Check: BATCH_SIZE constant in data_manager.js
   ```

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=*
```

## Migration from Old Scripts

### Replace These Files:
- ❌ `add_new_records.js`
- ❌ `clear_database.js`
- ❌ `generate_comprehensive_data.js`
- ❌ `generate_sample_bookings.js`

### Use Instead:
- ✅ `data_manager.js` (unified solution)

### Migration Steps:
1. Backup existing data (optional)
2. Run: `node data_manager.js --action=clear`
3. Run: `node data_manager.js --action=setup`
4. Verify: `node data_manager.js --action=stats`

## API Integration

The generated data is fully compatible with the existing API endpoints:

- `/api/search/flights` - Search generated flights
- `/api/search/trains` - Search generated trains
- `/api/search/hotels` - Search generated hotels
- `/api/bookings` - Create bookings with generated data
- `/api/admin/*` - Admin operations on generated data

## Security Notes

1. **Change Default Passwords** - Update admin password in production
2. **Secure JWT Secret** - Use a strong, random JWT secret
3. **Environment Variables** - Never commit .env files
4. **Database Access** - Restrict MongoDB access in production

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify environment configuration
3. Check MongoDB connection
4. Review error messages for specific issues

---

**Note**: This unified data management system replaces all previous individual scripts and provides a more robust, efficient, and maintainable solution for database operations.
