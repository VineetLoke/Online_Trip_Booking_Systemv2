const debug = require('debug');

// Create debug namespaces for different modules
const debuggers = {
  server: debug('booking:server'),
  auth: debug('booking:auth'),
  database: debug('booking:database'),
  api: debug('booking:api'),
  booking: debug('booking:booking'),
  search: debug('booking:search'),
  user: debug('booking:user'),
  admin: debug('booking:admin'),
  error: debug('booking:error')
};

// Enhanced console logging with timestamps and colors
const logger = {
  info: (message, data = '') => {
    const timestamp = new Date().toISOString();
    console.log(`\x1b[36m[${timestamp}] INFO:\x1b[0m ${message}`, data);
  },
  
  error: (message, error = '') => {
    const timestamp = new Date().toISOString();
    console.error(`\x1b[31m[${timestamp}] ERROR:\x1b[0m ${message}`, error);
    if (error && error.stack) {
      console.error('\x1b[31mStack:\x1b[0m', error.stack);
    }
  },
  
  warn: (message, data = '') => {
    const timestamp = new Date().toISOString();
    console.warn(`\x1b[33m[${timestamp}] WARN:\x1b[0m ${message}`, data);
  },
  
  success: (message, data = '') => {
    const timestamp = new Date().toISOString();
    console.log(`\x1b[32m[${timestamp}] SUCCESS:\x1b[0m ${message}`, data);
  },
  
  debug: (namespace, message, data = '') => {
    if (debuggers[namespace]) {
      debuggers[namespace](message, data);
    }
  }
};

// Performance monitoring
const performance = {
  start: (label) => {
    console.time(label);
    logger.debug('performance', `Started: ${label}`);
  },
  
  end: (label) => {
    console.timeEnd(label);
    logger.debug('performance', `Completed: ${label}`);
  },
  
  mark: (label, message) => {
    logger.info(`⏱️  ${label}`, message);
  }
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, url, ip } = req;
  
  logger.info(`🌐 ${method} ${url}`, `from ${ip}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    logger.info(`${statusColor}${res.statusCode}\x1b[0m ${method} ${url}`, `${duration}ms`);
  });
  
  next();
};

// Database operation logger
const dbLogger = {
  query: (operation, collection, query = {}) => {
    logger.debug('database', `${operation} on ${collection}`, JSON.stringify(query, null, 2));
  },
  
  result: (operation, collection, count = 0) => {
    logger.debug('database', `${operation} on ${collection} returned ${count} documents`);
  },
  
  error: (operation, collection, error) => {
    logger.error(`Database ${operation} failed on ${collection}`, error);
  }
};

// API response logger
const apiLogger = {
  request: (endpoint, method, data) => {
    logger.debug('api', `${method} ${endpoint}`, data);
  },
  
  response: (endpoint, method, statusCode, data) => {
    const color = statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    logger.debug('api', `${color}${statusCode}\x1b[0m ${method} ${endpoint}`, data);
  },
  
  error: (endpoint, method, error) => {
    logger.error(`API Error: ${method} ${endpoint}`, error);
  }
};

module.exports = {
  debug: debuggers,
  logger,
  performance,
  requestLogger,
  dbLogger,
  apiLogger
};