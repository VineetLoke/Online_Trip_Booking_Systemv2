# Development Scripts for Online Booking System

## Quick Development Commands

### Backend Development
```powershell
# Start backend in development mode with hot reload
cd backend
npm run dev

# Start backend in debug mode
npm run debug

# Run database setup
npm run setup-db

# Clear and reset database
npm run reset-db

# Generate sample data
npm run generate-data

# Run backend tests
npm run test
```

### Frontend Development
```powershell
# Start frontend development server
cd frontend
npm run serve

# Build for production
npm run build
```

### Testing
```powershell
# Run all tests
npm run test:all

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm run test:coverage
```

## Debugging Features

### VS Code Integration
- **F5**: Start backend server in debug mode
- **Ctrl+Shift+P** → "Debug: Start Backend" for quick debugging
- Breakpoints work in all JavaScript files
- Variables inspection and watch expressions
- Debug console for runtime evaluation

### Enhanced Logging
```javascript
// Use the logger utility
const { logger, performance } = require('./utils/logger');

// Different log levels
logger.info('Server started successfully');
logger.error('Database connection failed', error);
logger.warn('Deprecated API endpoint used');
logger.success('User registration completed');

// Performance monitoring
performance.start('database-query');
// ... database operation
performance.end('database-query');
```

### Debug Namespaces
Set DEBUG environment variable to control what gets logged:
```bash
# Log everything
DEBUG=booking:*

# Log only server and database
DEBUG=booking:server,booking:database

# Log only errors
DEBUG=booking:error
```

## API Testing

### Using VS Code REST Client
Create `.http` files for API testing:

```http
### Health Check
GET http://localhost:3000/api/health

### User Registration
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "1234567890",
  "password": "password123"
}
```

### Using Postman Collection
Import the provided Postman collection for comprehensive API testing.

## Database Management

### MongoDB Connection
```javascript
// Check connection status
const mongoose = require('mongoose');
console.log('Connection state:', mongoose.connection.readyState);
// 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
```

### Data Management Commands
```bash
# Setup complete database with sample data
node data_manager.js --action=setup

# Clear all data
node data_manager.js --action=clear

# Generate specific data
node data_manager.js --action=generate --type=flights --days=30

# View database statistics
node data_manager.js --action=stats
```

## Performance Monitoring

### Built-in Profiling
```javascript
// In your routes
const { performance } = require('../utils/logger');

app.get('/api/flights', async (req, res) => {
  performance.start('flight-search');
  const flights = await Flight.find(query);
  performance.end('flight-search');
  res.json(flights);
});
```

### Memory Monitoring
```javascript
// Add to server.js for memory monitoring
setInterval(() => {
  const used = process.memoryUsage();
  console.log('Memory Usage:', {
    rss: Math.round(used.rss / 1024 / 1024) + ' MB',
    heapTotal: Math.round(used.heapTotal / 1024 / 1024) + ' MB',
    heapUsed: Math.round(used.heapUsed / 1024 / 1024) + ' MB'
  });
}, 30000); // Every 30 seconds
```

## Error Tracking

### Enhanced Error Handling
```javascript
// Global error handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
```

## Environment Management

### Multiple Environments
- `development` - Local development with debug logging
- `testing` - For running tests
- `production` - Production deployment

### Environment Variables
```bash
# Development
NODE_ENV=development
DEBUG=booking:*
LOG_LEVEL=debug

# Production
NODE_ENV=production
DEBUG=booking:error
LOG_LEVEL=error
```

## Troubleshooting Guide

### Common Issues and Solutions

1. **Port Already in Use**
   ```bash
   # Find process using port 3000
   netstat -ano | findstr :3000
   # Kill the process
   taskkill /PID <PID> /F
   ```

2. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB service
   net start MongoDB
   # Check connection
   mongosh --eval "db.runCommand({connectionStatus : 1})"
   ```

3. **Node Modules Issues**
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   ```

## Code Navigation

### File Structure Overview
```
backend/
├── models/         # Database schemas
├── routes/         # API endpoints
├── middleware/     # Auth & validation
├── utils/          # Helper functions
└── server.js       # Main entry point

frontend/
├── pages/          # HTML pages
├── js/             # Client-side scripts
└── css/            # Stylesheets

tests/
├── unit_tests.js   # Unit tests
└── integration_tests.js # Integration tests
```

### Key Files for Debugging
- `backend/server.js` - Main server configuration
- `backend/utils/logger.js` - Enhanced logging
- `backend/data_manager.js` - Database operations
- `frontend/pages/admin/admin.js` - Admin panel logic