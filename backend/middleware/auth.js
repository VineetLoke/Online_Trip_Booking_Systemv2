const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Middleware to verify user JWT token
exports.authenticateUser = async (req, res, next) => {
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
    
    if (req.admin.role === 'super_admin' || req.admin.permissions.includes(permission)) {
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

