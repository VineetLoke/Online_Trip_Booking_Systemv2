/**
 * Online Booking System - Configuration
 */

// API Base URL - can be configured via environment or defaults to localhost
const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? 'http://localhost:3000/api'
  : `${window.location.protocol}//${window.location.hostname}:3000/api`;

// Make available on the window so page-specific scripts can reuse it without redeclaring
window.API_BASE_URL = API_BASE_URL;
