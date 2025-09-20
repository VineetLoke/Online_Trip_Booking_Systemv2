const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Rate limiting for authentication attempts
const authAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of authAttempts.entries()) {
    if (now - value.lastAttempt > LOCKOUT_TIME) {
      authAttempts.delete(key);
    }
  }
}, 60 * 60 * 1000);

// Rate limiting middleware
exports.rateLimitAuth = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (authAttempts.has(clientIP)) {
    const attempts = authAttempts.get(clientIP);
    
    // Check if still in lockout period
    if (attempts.count >= MAX_ATTEMPTS && (now - attempts.lastAttempt) < LOCKOUT_TIME) {
      return res.status(429).json({
        error: {
          message: 'Too many authentication attempts. Please try again later.',
          status: 429,
          retryAfter: Math.ceil((LOCKOUT_TIME - (now - attempts.lastAttempt)) / 1000)
        }
      });
    }
    
    // Reset if lockout period has passed
    if ((now - attempts.lastAttempt) >= LOCKOUT_TIME) {
      authAttempts.delete(clientIP);
    }
  }
  
  next();
};

// Record failed authentication attempt
exports.recordFailedAuth = (req) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (authAttempts.has(clientIP)) {
    const attempts = authAttempts.get(clientIP);
    attempts.count++;
    attempts.lastAttempt = now;
  } else {
    authAttempts.set(clientIP, { count: 1, lastAttempt: now });
  }
};

// Clear successful authentication attempt
exports.clearAuthAttempts = (req) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  authAttempts.delete(clientIP);
};

// Middleware to verify user JWT token
exports.authenticateUser = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          message: 'Authentication failed. Invalid authorization header format.',
          status: 401
        }
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token || token.length < 10) {
      return res.status(401).json({
        error: {
          message: 'Authentication failed. Invalid token format.',
          status: 401
        }
      });
    }
    
    // Verify token with additional security checks
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'], // Explicitly specify allowed algorithms
      maxAge: process.env.JWT_EXPIRES_IN || '24h'
    });
    
    // Additional validation
    if (!decoded.id || typeof decoded.id !== 'string') {
      return res.status(401).json({
        error: {
          message: 'Authentication failed. Invalid token payload.',
          status: 401
        }
      });
    }
    
// Check if user exists
const user = await User.findById(decoded.id);
 
if (!user) {
  return res.status(401).json({
    error: {
      message: 'Authentication failed. User not found.',
      status: 401
    }
  });
}
 
// Add user to request object
req.user = user;
req.userId = user._id.toString();
next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          message: 'Authentication failed. Token has expired.',
          status: 401
        }
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: {
          message: 'Authentication failed. Invalid token.',
          status: 401
        }
      });
    }
    
    return res.status(401).json({
      error: {
        message: 'Authentication failed. Token verification error.',
        status: 401
      }
    });
  }
};

// Middleware to verify admin JWT token
exports.authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: {
          message: 'Authentication failed. No token provided.',
          status: 401
        }
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if admin exists
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      return res.status(401).json({
        error: {
          message: 'Authentication failed. Admin not found.',
          status: 401
        }
      });
    }
    
    // Add admin to request object
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        message: 'Authentication failed. Invalid token.',
        status: 401
      }
    });
  }
};

// Middleware to check admin permissions
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        error: {
          message: 'Authentication failed. Admin not found.',
          status: 401
        }
      });
    }
    
const perms = Array.isArray(req.admin.permissions) ? req.admin.permissions : [];
if (req.admin.role === 'super_admin' || perms.includes(permission)) {
  next();
} else {
  return res.status(403).json({
    error: {
      message: 'Access denied. Insufficient permissions.',
      status: 403
    }
  });
}
  };
};

