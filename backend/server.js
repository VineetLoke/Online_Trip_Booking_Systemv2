const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

 const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple in-memory SSE client registry
const sseClients = new Set();
const eventHistory = [];
const EVENT_HISTORY_LIMIT = 100;

// SSE endpoint for admin panel to receive real-time logs
app.get('/api/admin/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  // Allow CORS for SSE explicitly (some browsers are picky on EventSource)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders && res.flushHeaders();

  // Keep connection alive
  const keepAlive = setInterval(() => {
    try { res.write(': ping\n\n'); } catch (e) {}
  }, 15000);

  // Send a connected comment
  try { res.write(': connected\n\n'); } catch (e) {}

  // Register client
  sseClients.add(res);

  // Optional: send recent history so the admin sees recent activity on connect
  for (const entry of eventHistory) {
    try {
      res.write(`event: ${entry.event}\n`);
      res.write(`data: ${JSON.stringify(entry)}\n\n`);
    } catch (e) {}
  }

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(keepAlive);
    sseClients.delete(res);
  });
});

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for development
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Wire the event bus to broadcast to SSE clients
const eventBus = require('./utils/eventBus');
const broadcast = (event, payload) => {
  const entry = { event, payload, timestamp: new Date().toISOString() };
  const data = JSON.stringify(entry);

  // Add to history buffer
  eventHistory.push(entry);
  if (eventHistory.length > EVENT_HISTORY_LIMIT) {
    eventHistory.shift();
  }

  for (const client of sseClients) {
    try {
      client.write(`event: ${event}\n`);
      client.write(`data: ${data}\n\n`);
    } catch (e) {
      // Drop broken connections
      sseClients.delete(client);
    }
  }
};

// Events we care about
['user:registered', 'booking:created'].forEach((evt) => {
  eventBus.on(evt, (payload) => broadcast(evt, payload));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Online Booking System API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Online Booking System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      search: '/api/search',
      bookings: '/api/bookings',
      users: '/api/users',
      admin: '/api/admin',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({
    error: {
      message: error.message || 'Internal Server Error',
      status: error.status || 500
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// Function to find available port
const findAvailablePort = (startPort) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(startPort, '0.0.0.0', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Try next port
        findAvailablePort(startPort + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
};

// Start server with error handling
const startServer = async () => {
  try {
    const availablePort = await findAvailablePort(PORT);
    
    const server = app.listen(availablePort, '0.0.0.0', () => {
      console.log(`Server is running on http://0.0.0.0:${availablePort}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
    // Handle server errors
    server.on('error', (err) => {
      console.error('Server error:', err);
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${err.port} is already in use. Please stop the existing process or use a different port.`);
      }
      process.exit(1);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      server.close(() => {
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      server.close(() => {
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;

