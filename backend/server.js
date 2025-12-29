const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration - Environment-based origin control (declare before any routes use it)
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://yourdomain.com', 'https://www.yourdomain.com'] // Replace with your actual domain
  : [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5500',
      'http://127.0.0.1:5500',
      'http://localhost:8000',
      'http://127.0.0.1:8000'
    ];

const isDevLocalhost = (origin) => {
  if (process.env.NODE_ENV === 'production') return false;
  return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '');
};

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
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || isDevLocalhost(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
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
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || isDevLocalhost(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // Cache preflight response for 24 hours
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MongoDB Connection with retry logic
const connectToMongoDB = async (retryCount = 0) => {
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      heartbeatFrequencyMS: 2000, // Check connection every 2 seconds
      maxPoolSize: 10, // Maximum number of connections
      minPoolSize: 2,  // Minimum number of connections
    });
    console.log('✅ Successfully connected to MongoDB');
    
    // Handle MongoDB connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });
    
  } catch (error) {
    console.error(`❌ MongoDB connection attempt ${retryCount + 1} failed:`, error.message);
    
    if (retryCount < maxRetries) {
      console.log(`⏳ Retrying MongoDB connection in ${retryDelay / 1000} seconds... (${retryCount + 1}/${maxRetries})`);
      setTimeout(() => {
        connectToMongoDB(retryCount + 1);
      }, retryDelay);
    } else {
      console.error('💀 Failed to connect to MongoDB after maximum retries. Exiting...');
      process.exit(1);
    }
  }
};

// Initialize MongoDB connection
connectToMongoDB();

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

// Start server with recursive port finding
const startServer = (port) => {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('Shutting down server...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

// Start the server
startServer(PORT);

module.exports = app;

