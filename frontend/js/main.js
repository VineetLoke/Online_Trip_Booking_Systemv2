/**
 * Online Booking System - Main JavaScript
 */

// API Base URL - can be configured via environment or defaults to localhost
const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') 
  ? 'http://localhost:3000/api' 
  : `${window.location.protocol}//${window.location.hostname}:3000/api`;
// Make available on the window so page-specific scripts can reuse it without redeclaring
window.API_BASE_URL = API_BASE_URL;

// Safe fallback for admin logout to avoid ReferenceError if admin.js fails to load
if (typeof window.adminLogout !== 'function') {
  window.adminLogout = function(e) {
    try { if (e && e.preventDefault) e.preventDefault(); } catch (err) {}
    // Fallback behavior: clear admin tokens and redirect to admin login
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/pages/admin/login.html';
  };
}

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Bootstrap components like tooltips and popovers
  initializeBootstrapComponents();
  
  // Setup Authentication for Sets up login/register/logout buttons so they do something when clicked
  setupAuthentication();
  
  // Setup Navigation for Highlights which menu item (Home, Flights, etc.) is currently active.
  setupNavigation();
  
  // Setup Search Forms for actually working
  setupSearchForms();
  
  // Setup Terms & Conditions Modal
  setupTermsModal();
  
  // Setup swap buttons for flight and train search forms
  setupSwapButtons();
  
  // Check if user is logged in or not (but skip on admin pages)
  if (!window.location.pathname.includes('/admin/')) {
    checkAuthStatus();
  }
});

/**
 * Initialize Bootstrap Components
 */
function initializeBootstrapComponents() {
  // Initialize all tooltips
  // map function loops all over the elment
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Initialize all popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
}

/**
 * Setup Authentication
 */
function setupAuthentication() {
  // Register Form Submission
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = document.getElementById('registerName').value;
      const email = document.getElementById('registerEmail').value;
      const phone = document.getElementById('registerPhone').value;
      const password = document.getElementById('registerPassword').value;
      
      register(name, email, phone, password);
    });
  }
  
  // Login Form Submission
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      login(email, password);
    });
  }
  
  // Logout Buttons (support both regular and admin pages)
  const logoutBtn = document.getElementById('logoutBtn');
  const logoutBtn2 = document.getElementById('logoutBtn2');

  const attachLogout = (el) => {
    if (!el) return;
    el.addEventListener('click', function(e) {
      e.preventDefault();
      try {
        if (window.isAdminPage || window.location.pathname.includes('/admin/')) {
          // Use admin-specific logout if available
          if (typeof window.adminLogout === 'function') {
            window.adminLogout(e);
          } else {
            // Fallback: clear admin tokens and redirect
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = '/pages/admin/login.html';
          }
        } else {
          // Regular site logout
          logout();
        }
      } catch (err) {
        // Safe fallback
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    });
  };

  attachLogout(logoutBtn);
  attachLogout(logoutBtn2);
}

/**
 * Setup Navigation
 */
function setupNavigation() {
  // Active link highlighting
  const currentLocation = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentLocation) {
      link.classList.add('active');
    }
  });
}
// Show which page you're on in the navbar.


/**
 * Setup Search Forms
 */
function setupSearchForms() {
  // Flight Search Form
  const flightSearchForm = document.getElementById('flightSearchForm');
  if (flightSearchForm) {
    flightSearchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const source = document.getElementById('flightSource').value;
      const destination = document.getElementById('flightDestination').value;
      const date = document.getElementById('flightDate').value;
      
      searchFlights(source, destination, date);
    });
  }
  
  // Train Search Form
  const trainSearchForm = document.getElementById('trainSearchForm');
  if (trainSearchForm) {
    trainSearchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const source = document.getElementById('trainSource').value;
      const destination = document.getElementById('trainDestination').value;
      const date = document.getElementById('trainDate').value;
      
      searchTrains(source, destination, date);
    });
  }
  
  // Hotel Search Form
  const hotelSearchForm = document.getElementById('hotelSearchForm');
  if (hotelSearchForm) {
    hotelSearchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const location = document.getElementById('hotelLocation').value;
      const checkIn = document.getElementById('hotelCheckIn').value;
      const checkOut = document.getElementById('hotelCheckOut').value;
      
      searchHotels(location, checkIn, checkOut);
    });
  }
}

/**
 * Check Authentication Status
 */
function checkAuthStatus() {
  const token = localStorage.getItem('token');
  
  if (token) {
    // User is logged in
    fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        // Token is invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        updateAuthUI(false);
        throw new Error('Invalid token');
      }
    })
    .then(data => {
      // Store user data
      localStorage.setItem('user', JSON.stringify(data.user));
      updateAuthUI(true);
    })
    .catch(error => {
      console.error('Error checking auth status:', error);
      updateAuthUI(false);
    });
  } else {
    // User is not logged in
    updateAuthUI(false);
  }
}

/**
 * Update Authentication UI
 */
function updateAuthUI(isLoggedIn) {
  const authButtons = document.getElementById('authButtons');
  const userDropdown = document.getElementById('userDropdown');
  
  if (authButtons && userDropdown) {
    if (isLoggedIn) {
      // Show user dropdown, hide auth buttons
      authButtons.classList.add('d-none');
      userDropdown.classList.remove('d-none');
      
      // Update user name
      const user = JSON.parse(localStorage.getItem('user'));
      const userNameElement = document.getElementById('userName');
      if (userNameElement && user) {
        userNameElement.textContent = user.name;
      }
    } else {
      // Show auth buttons, hide user dropdown
      authButtons.classList.remove('d-none');
      userDropdown.classList.add('d-none');
    }
  }
}

/**
 * Register User
 */
function register(name, email, phone, password) {
  fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, phone, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      showAlert('registerAlert', data.error.message, 'danger');
    } else {
      // Registration successful
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Close modal and update UI
      const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
      registerModal.hide();
      
      updateAuthUI(true);
      showAlert('mainAlert', 'Registration successful! Welcome to Online Booking System.', 'success');
    }
  })
  .catch(error => {
    console.error('Error registering user:', error);
    showAlert('registerAlert', 'An error occurred. Please try again.', 'danger');
  });
}

/**
 * Login User
 */
function login(email, password) {
  fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      showAlert('loginAlert', data.error.message, 'danger');
    } else {
      // Login successful
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Close modal and update UI
      const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
      loginModal.hide();
      
      updateAuthUI(true);
      showAlert('mainAlert', 'Login successful! Welcome back.', 'success');
    }
  })
  .catch(error => {
    console.error('Error logging in:', error);
    showAlert('loginAlert', 'An error occurred. Please try again.', 'danger');
  });
}

/**
 * Logout User
 */
function logout() {
  // Clear local storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Update UI
  updateAuthUI(false);
  showAlert('mainAlert', 'You have been logged out.', 'info');
}

/**
 * Search Flights
 */
function searchFlights(source, destination, date) {
  // Show loading indicator
  const resultsContainer = document.getElementById('searchResults');
  if (resultsContainer) {
    resultsContainer.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-3">Searching for flights...</p></div>';
  }
  
  // Build query string
  const queryParams = new URLSearchParams();
  if (source) queryParams.append('source', source);
  if (destination) queryParams.append('destination', destination);
  if (date) queryParams.append('date', date);
  
  // Fetch flights
  fetch(`${API_BASE_URL}/search/flights?${queryParams.toString()}`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        showAlert('searchAlert', data.error.message, 'danger');
        resultsContainer.innerHTML = '<div class="text-center py-5"><p>No results found. Please try different search criteria.</p></div>';
      } else {
        displayFlightResults(data.flights);
      }
    })
    .catch(error => {
      console.error('Error searching flights:', error);
      showAlert('searchAlert', 'An error occurred while searching. Please try again.', 'danger');
      resultsContainer.innerHTML = '<div class="text-center py-5"><p>An error occurred. Please try again.</p></div>';
    });
}

/**
 * Search Trains
 */
function searchTrains(source, destination, date) {
  // Show loading indicator
  const resultsContainer = document.getElementById('searchResults');
  if (resultsContainer) {
    resultsContainer.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-3">Searching for trains...</p></div>';
  }
  
  // Build query string
  const queryParams = new URLSearchParams();
  if (source) queryParams.append('source', source);
  if (destination) queryParams.append('destination', destination);
  if (date) queryParams.append('date', date);
  
  // Fetch trains
  fetch(`${API_BASE_URL}/search/trains?${queryParams.toString()}`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        showAlert('searchAlert', data.error.message, 'danger');
        resultsContainer.innerHTML = '<div class="text-center py-5"><p>No results found. Please try different search criteria.</p></div>';
      } else {
        displayTrainResults(data.trains);
      }
    })
    .catch(error => {
      console.error('Error searching trains:', error);
      showAlert('searchAlert', 'An error occurred while searching. Please try again.', 'danger');
      resultsContainer.innerHTML = '<div class="text-center py-5"><p>An error occurred. Please try again.</p></div>';
    });
}

/**
 * Search Hotels
 */
function searchHotels(location, checkIn, checkOut) {
  // Show loading indicator
  const resultsContainer = document.getElementById('searchResults');
  if (resultsContainer) {
    resultsContainer.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-3">Searching for hotels...</p></div>';
  }
  
  // Build query string
  const queryParams = new URLSearchParams();
  if (location) queryParams.append('location', location);
  if (checkIn) queryParams.append('checkIn', checkIn);
  if (checkOut) queryParams.append('checkOut', checkOut);
  
  // Fetch hotels
  fetch(`${API_BASE_URL}/search/hotels?${queryParams.toString()}`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        showAlert('searchAlert', data.error.message, 'danger');
        resultsContainer.innerHTML = '<div class="text-center py-5"><p>No results found. Please try different search criteria.</p></div>';
      } else {
        displayHotelResults(data.hotels);
      }
    })
    .catch(error => {
      console.error('Error searching hotels:', error);
      showAlert('searchAlert', 'An error occurred while searching. Please try again.', 'danger');
      resultsContainer.innerHTML = '<div class="text-center py-5"><p>An error occurred. Please try again.</p></div>';
    });
}

/**
 * Display Flight Results
 */
function displayFlightResults(flights) {
  const resultsContainer = document.getElementById('searchResults');
  
  if (!resultsContainer) return;
  
  // Client-side filter to mirror server-side filtering
  const now = new Date();
  const bufferMinutes = 60; // 60 minutes buffer
  const cutoffTime = new Date(now.getTime() + bufferMinutes * 60 * 1000);
  
  const availableFlights = flights.filter(flight => {
    const departureTime = new Date(flight.departureTime);
    return departureTime > cutoffTime;
  });
  
  if (availableFlights.length === 0) {
    resultsContainer.innerHTML = '<div class="text-center py-5"><p>No flights found. Please try different search criteria.</p></div>';
    return;
  }
  
  let html = '<h3 class="mb-4">Flight Search Results</h3>';
  
  availableFlights.forEach(flight => {
    const departureTime = new Date(flight.departureTime);
    const arrivalTime = new Date(flight.arrivalTime);
    
    html += `
      <div class="search-result">
        <div class="row align-items-center">
          <div class="col-md-3">
            <h5 class="mb-1">${flight.airline}</h5>
            <p class="text-muted mb-0">Flight ${flight.flightNumber}</p>
          </div>
          <div class="col-md-4">
            <div class="d-flex align-items-center">
              <div class="text-center">
                <h5 class="mb-0">${departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h5>
                <p class="mb-0">${flight.source}</p>
              </div>
              <div class="mx-3 flex-grow-1 text-center">
                <i class="fas fa-plane"></i>
                <div class="progress" style="height: 2px;">
                  <div class="progress-bar bg-primary" role="progressbar" style="width: 100%"></div>
                </div>
                <small>${getDurationString(departureTime, arrivalTime)}</small>
              </div>
              <div class="text-center">
                <h5 class="mb-0">${arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h5>
                <p class="mb-0">${flight.destination}</p>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <p class="mb-0">Available Seats: ${flight.availableSeats}</p>
            <p class="mb-0">${flight.aircraft}</p>
          </div>
          <div class="col-md-3 text-end">
            <div class="price mb-2">₹${flight.price}</div>
            <button class="btn btn-primary book-flight" data-id="${flight._id}">Book Now</button>
          </div>
        </div>
      </div>
    `;
  });
  
  resultsContainer.innerHTML = html;
  
  // Add event listeners to book buttons
  document.querySelectorAll('.book-flight').forEach(button => {
    button.addEventListener('click', function() {
      const flightId = this.getAttribute('data-id');
      bookFlight(flightId);
    });
  });
}

/**
 * Display Train Results
 */
function displayTrainResults(trains) {
  const resultsContainer = document.getElementById('searchResults');
  
  if (!resultsContainer) return;
  
  if (trains.length === 0) {
    resultsContainer.innerHTML = '<div class="text-center py-5"><p>No trains found. Please try different search criteria.</p></div>';
    return;
  }
  
  let html = '<h3 class="mb-4">Train Search Results</h3>';
  
  trains.forEach(train => {
    const departureTime = new Date(train.departureTime);
    const arrivalTime = new Date(train.arrivalTime);
    
    html += `
      <div class="search-result">
        <div class="row align-items-center">
          <div class="col-md-3">
            <h5 class="mb-1">${train.trainName}</h5>
            <p class="text-muted mb-0">Train ${train.trainNumber}</p>
          </div>
          <div class="col-md-4">
            <div class="d-flex align-items-center">
              <div class="text-center">
                <h5 class="mb-0">${departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h5>
                <p class="mb-0">${train.source}</p>
                <small>${departureTime.toLocaleDateString()}</small>
              </div>
              <div class="mx-3 flex-grow-1 text-center">
                <i class="fas fa-train"></i>
                <div class="progress" style="height: 2px;">
                  <div class="progress-bar bg-primary" role="progressbar" style="width: 100%"></div>
                </div>
                <small>${getDurationString(departureTime, arrivalTime)}</small>
              </div>
              <div class="text-center">
                <h5 class="mb-0">${arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h5>
                <p class="mb-0">${train.destination}</p>
                <small>${arrivalTime.toLocaleDateString()}</small>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <p class="mb-0">Available Seats: ${train.availableSeats}</p>
            <p class="mb-0">Class: ${train.class}</p>
          </div>
          <div class="col-md-3 text-end">
            <div class="price mb-2">₹${train.price}</div>
            <button class="btn btn-primary book-train" data-id="${train._id}">Book Now</button>
          </div>
        </div>
      </div>
    `;
  });
  
  resultsContainer.innerHTML = html;
  
  // Add event listeners to book buttons
  document.querySelectorAll('.book-train').forEach(button => {
    button.addEventListener('click', function() {
      const trainId = this.getAttribute('data-id');
      bookTrain(trainId);
    });
  });
}

/**
 * Display Hotel Results
 */
function displayHotelResults(hotels) {
  const resultsContainer = document.getElementById('searchResults');
  
  if (!resultsContainer) return;
  
  if (hotels.length === 0) {
    resultsContainer.innerHTML = '<div class="text-center py-5"><p>No hotels found. Please try different search criteria.</p></div>';
    return;
  }
  
  let html = '<h3 class="mb-4">Hotel Search Results</h3>';
  html += '<div class="row">';
  
  hotels.forEach(hotel => {
    html += `
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <img src="${hotel.images && hotel.images.length > 0 ? hotel.images[0] : 'images/hotel-placeholder.jpg'}" class="card-img-top" alt="${hotel.name}">
          <div class="card-body">
            <h5 class="card-title">${hotel.name}</h5>
            <p class="card-text mb-1"><i class="fas fa-map-marker-alt text-secondary me-2"></i>${hotel.location}</p>
            <p class="card-text mb-2">
              <span class="badge bg-primary">${hotel.rating} <i class="fas fa-star"></i></span>
              <span class="ms-2">${hotel.roomType}</span>
            </p>
            <p class="card-text">
              <small class="text-muted">
                Amenities: ${hotel.amenities.slice(0, 3).join(', ')}${hotel.amenities.length > 3 ? '...' : ''}
              </small>
            </p>
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div class="price">₹${hotel.price}<small>/night</small></div>
              <button class="btn btn-primary book-hotel" data-id="${hotel._id}">Book Now</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  resultsContainer.innerHTML = html;
  
  // Add event listeners to book buttons
  document.querySelectorAll('.book-hotel').forEach(button => {
    button.addEventListener('click', function() {
      const hotelId = this.getAttribute('data-id');
      bookHotel(hotelId);
    });
  });
}

/**
 * Book Flight
 */
function bookFlight(flightId) {
  // Check if user is logged in
  if (!isLoggedIn()) {
    showLoginPrompt();
    return;
  }
  
  // Redirect to booking page with flight ID
  window.location.href = `booking.html?type=flight&id=${flightId}`;
}

/**
 * Book Train
 */
function bookTrain(trainId) {
  // Check if user is logged in
  if (!isLoggedIn()) {
    showLoginPrompt();
    return;
  }
  
  // Redirect to booking page with train ID
  window.location.href = `booking.html?type=train&id=${trainId}`;
}

/**
 * Book Hotel
 */
function bookHotel(hotelId) {
  // Check if user is logged in
  if (!isLoggedIn()) {
    showLoginPrompt();
    return;
  }
  
  // Redirect to booking page with hotel ID
  window.location.href = `booking.html?type=hotel&id=${hotelId}`;
}

/**
 * Check if User is Logged In
 */
function isLoggedIn() {
  return localStorage.getItem('token') !== null;
}

/**
 * Show Login Prompt
 */
function showLoginPrompt() {
  // Show login modal
  const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
  loginModal.show();
  
  // Show alert in modal
  showAlert('loginAlert', 'Please login to continue with booking.', 'info');
}

/**
 * Show Alert
 */
function showAlert(elementId, message, type) {
  const alertElement = document.getElementById(elementId);
  
  if (alertElement) {
    alertElement.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      const alert = alertElement.querySelector('.alert');
      if (alert) {
        const bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
      }
    }, 5000);
  }
}

/**
 * Get Duration String
 */
function getDurationString(start, end) {
  const durationMs = end - start;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}
/**
 * Setup Terms & Conditions Modal
 */
function setupTermsModal() {
  // Create the modal if it doesn't exist
  if (!document.getElementById('termsModal')) {
    const modalHTML = createTermsModalHTML();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
  
  // Attach event listeners to all Terms & Conditions links
  const termsLinks = document.querySelectorAll('a[href="terms.html"], a[href="#terms"], a[data-terms-modal]');
  termsLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      showTermsModal();
    });
  });
  
  // Setup modal keyboard navigation (ESC to close)
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const modal = document.getElementById('termsModal');
      if (modal && modal.classList.contains('show')) {
        hideTermsModal();
      }
    }
  });
}

/**
 * Show Terms & Conditions Modal
 */
function showTermsModal() {
  const modal = document.getElementById('termsModal');
  if (modal) {
    const bsModal = new bootstrap.Modal(modal, {
      backdrop: true,
      keyboard: true,
      focus: true
    });
    bsModal.show();
    
    // Set focus trap
    trapFocus(modal);
  }
}

/**
 * Hide Terms & Conditions Modal
 */
function hideTermsModal() {
  const modal = document.getElementById('termsModal');
  if (modal) {
    const bsModal = bootstrap.Modal.getInstance(modal);
    if (bsModal) {
      bsModal.hide();
    }
  }
}

/**
 * Create Terms Modal HTML
 */
function createTermsModalHTML() {
  return `
    <!-- Terms & Conditions Modal -->
    <div class="modal fade" id="termsModal" tabindex="-1" aria-labelledby="termsModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="termsModalLabel">
              <i class="fas fa-file-contract me-2"></i>Terms & Conditions
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted mb-4"><strong>Last updated:</strong> January 1, 2025</p>
            
            <h6 class="text-primary mb-3">1. Acceptance of Terms</h6>
            <p>By accessing and using TravelEase, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
            
            <h6 class="text-primary mb-3">2. Service Description</h6>
            <p>TravelEase is an online travel booking platform that allows users to search, compare, and book flights, trains, and hotels. We act as an intermediary between travelers and travel service providers.</p>
            
            <h6 class="text-primary mb-3">3. User Accounts</h6>
            <ul>
              <li>You must be at least 18 years old to create an account</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You agree to provide accurate, current, and complete information</li>
              <li>You are responsible for all activities that occur under your account</li>
            </ul>
            
            <h6 class="text-primary mb-3">4. Booking and Payment</h6>
            <ul>
              <li>All bookings are subject to availability and confirmation</li>
              <li>Prices are subject to change until booking is confirmed</li>
              <li>Payment must be made in full at the time of booking</li>
              <li>We accept major credit cards and secure payment methods</li>
              <li>Additional fees may apply for certain services</li>
            </ul>
            
            <h6 class="text-primary mb-3">5. Cancellation and Refunds</h6>
            <ul>
              <li>Cancellation policies vary by service provider</li>
              <li>Cancellation fees may apply as per provider policies</li>
              <li>Refunds are processed according to the original payment method</li>
              <li>Processing time for refunds may vary (typically 5-10 business days)</li>
            </ul>
            
            <h6 class="text-primary mb-3">6. User Responsibilities</h6>
            <ul>
              <li>Ensure all travel documents are valid and up-to-date</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Arrive at departure points with adequate time</li>
              <li>Report any issues or concerns promptly</li>
            </ul>
            
            <h6 class="text-primary mb-3">7. Limitation of Liability</h6>
            <p>TravelEase acts as an intermediary and is not liable for:</p>
            <ul>
              <li>Flight delays, cancellations, or schedule changes</li>
              <li>Hotel service quality or amenities</li>
              <li>Train service disruptions</li>
              <li>Force majeure events beyond our control</li>
              <li>Third-party service provider actions or omissions</li>
            </ul>
            
            <h6 class="text-primary mb-3">8. Privacy and Data Protection</h6>
            <p>We are committed to protecting your privacy. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.</p>
            
            <h6 class="text-primary mb-3">9. Intellectual Property</h6>
            <p>All content, trademarks, and intellectual property on TravelEase are owned by us or our licensors. You may not reproduce, distribute, or create derivative works without written permission.</p>
            
            <h6 class="text-primary mb-3">10. Prohibited Activities</h6>
            <p>You agree not to:</p>
            <ul>
              <li>Use the service for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Submit false or misleading information</li>
              <li>Interfere with the proper functioning of the website</li>
              <li>Engage in any activity that could harm our reputation</li>
            </ul>
            
            <h6 class="text-primary mb-3">11. Contact Information</h6>
            <p>If you have any questions about these Terms & Conditions, please contact us:</p>
            <ul class="list-unstyled">
              <li><i class="fas fa-envelope me-2"></i>Email: legal@travelease.com</li>
              <li><i class="fas fa-phone me-2"></i>Phone: +91 1234567890</li>
              <li><i class="fas fa-map-marker-alt me-2"></i>Address: 123 Travel Street, Mumbai, India</li>
            </ul>
            
            <div class="alert alert-info mt-4">
              <i class="fas fa-info-circle me-2"></i>
              <strong>Important:</strong> By using TravelEase, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Focus trap for accessibility
 */
function trapFocus(modal) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];
  
  modal.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    }
  });
}

/**
 * API function to cancel booking (moved from bookings.html)
 */
async function cancelBookingAPI(bookingId, reason) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Please login to cancel booking');
  }
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ reason })
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to cancel booking');
  }
  return await response.json();
}

// Sample data generation for testing (remove in production)
/*
const flightTemplates = [
  { airline: "Air India", flightNumber: "AI", basePrice: 5000, aircraft: "Boeing 737" },
  { airline: "IndiGo", flightNumber: "6E", basePrice: 3000, aircraft: "Airbus A320" },
  { airline: "SpiceJet", flightNumber: "SG", basePrice: 3500, aircraft: "Boeing 737" }
];

const trainTemplates = [
  { trainName: "Rajdhani Express", trainNumber: "12345", basePrice: 1500, class: "Sleeper" },
  { trainName: "Shatabdi Express", trainNumber: "54321", basePrice: 2500, class: "AC Chair" },
  { trainName: "Duronto Express", trainNumber: "67890", basePrice: 2000, class: "Sleeper" }
];

const hotelTemplates = [
  { name: "Taj Hotel", location: "Mumbai", basePrice: 8000, roomType: "Deluxe", amenities: ["WiFi", "Breakfast", "Pool"] },
  { name: "Marriott Hotel", location: "Delhi", basePrice: 9000, roomType: "Suite", amenities: ["WiFi", "Breakfast", "Gym"] },
  { name: "Hilton Hotel", location: "Bangalore", basePrice: 7000, roomType: "Standard", amenities: ["WiFi", "Breakfast", "Spa"] }
];

function generateSampleData() {
  const flights = [];
  const trains = [];
  const hotels = [];
  
  const startDate = new Date("2023-10-01");
  const endDate = new Date("2023-10-31");
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
  const currentDate = new Date(date);

  // Guarantee at least one flight per day
  const templateF = flightTemplates[0];
  const routeF = routes[0];
  const departureTimeF = new Date(currentDate);
  departureTimeF.setHours(9, 0, 0, 0);
  const arrivalTimeF = new Date(departureTimeF);
  arrivalTimeF.setHours(arrivalTimeF.getHours() + routeF.duration);
  flights.push({
    flightNumber: `${templateF.flightNumber}${String(currentDate.getDate()).padStart(2, '0')}${String(currentDate.getMonth()+1).padStart(2, '0')}`,
    airline: templateF.airline,
    source: routeF.source,
    destination: routeF.destination,
    departureTime: departureTimeF,
    arrivalTime: arrivalTimeF,
    price: templateF.basePrice,
    availableSeats: 100,
    totalSeats: 120,
    aircraft: templateF.aircraft,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  });
  // Add extra random flights for variety
  const numFlights = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < numFlights; i++) {
    const template = flightTemplates[Math.floor(Math.random() * flightTemplates.length)];
    const route = routes[Math.floor(Math.random() * routes.length)];
    const departureTime = new Date(currentDate);
    departureTime.setHours(6 + i * 3 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
    const arrivalTime = new Date(departureTime);
    arrivalTime.setHours(arrivalTime.getHours() + route.duration + Math.floor(Math.random() * 2));
    const price = template.basePrice + Math.floor(Math.random() * 2000);
    const totalSeats = 120 + Math.floor(Math.random() * 80);
    const availableSeats = Math.floor(totalSeats * (0.6 + Math.random() * 0.3));
    flights.push({
      flightNumber: `${template.flightNumber}${String(Math.floor(Math.random() * 900) + 100)}`,
      airline: template.airline,
      source: route.source,
      destination: route.destination,
      departureTime: departureTime,
      arrivalTime: arrivalTime,
      price: price,
      availableSeats: availableSeats,
      totalSeats: totalSeats,
      aircraft: template.aircraft,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Guarantee at least one train per day
  const templateT = trainTemplates[0];
  const routeT = routes[0];
  const departureTimeT = new Date(currentDate);
  departureTimeT.setHours(14, 0, 0, 0);
  const arrivalTimeT = new Date(departureTimeT);
  arrivalTimeT.setHours(arrivalTimeT.getHours() + routeT.duration * 2);
  trains.push({
    trainNumber: `${templateT.trainNumber}${String(currentDate.getDate()).padStart(2, '0')}${String(currentDate.getMonth()+1).padStart(2, '0')}`,
    trainName: templateT.trainName,
    source: routeT.source,
    destination: routeT.destination,
    departureTime: departureTimeT,
    arrivalTime: arrivalTimeT,
    price: templateT.basePrice,
    availableSeats: 150,
    totalSeats: 200,
    class: templateT.class,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  });
  // Add extra random trains for variety
  const numTrains = 1 + Math.floor(Math.random() * 2);
  for (let i = 0; i < numTrains; i++) {
    const template = trainTemplates[Math.floor(Math.random() * trainTemplates.length)];
    const route = routes[Math.floor(Math.random() * routes.length)];
    const departureTime = new Date(currentDate);
    departureTime.setHours(16 + i * 4 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
    const arrivalTime = new Date(departureTime);
    arrivalTime.setHours(arrivalTime.getHours() + route.duration * 2 + Math.floor(Math.random() * 8));
    const price = template.basePrice + Math.floor(Math.random() * 1000);
    const totalSeats = 200 + Math.floor(Math.random() * 100);
    const availableSeats = Math.floor(totalSeats * (0.5 + Math.random() * 0.4));
    trains.push({
      trainNumber: `${template.trainNumber}${String(Math.floor(Math.random() * 10))}`,
      trainName: template.trainName,
      source: route.source,
      destination: route.destination,
      departureTime: departureTime,
      arrivalTime: arrivalTime,
      price: price,
      availableSeats: availableSeats,
      totalSeats: totalSeats,
      class: template.class,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Guarantee at least one hotel per day
  const templateH = hotelTemplates[0];
  const priceH = templateH.basePrice;
  const totalRoomsH = 40;
  const availableRoomsH = 30;
  hotels.push({
    name: `${templateH.name} ${currentDate.getFullYear()}`,
    location: templateH.location,
    address: `100 ${templateH.location} Street, ${templateH.location}`,
    price: priceH,
    rating: 4.5,
    amenities: ["WiFi", "Pool", "Restaurant", "Room Service", "Gym"],
    availableRooms: availableRoomsH,
    totalRooms: totalRoomsH,
    roomType: templateH.roomType,
    images: ["hotel1.jpg"],
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  });
  // Add extra random hotels for variety
  const numHotels = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < numHotels; i++) {
    const template = hotelTemplates[Math.floor(Math.random() * hotelTemplates.length)];
    const price = template.basePrice + Math.floor(Math.random() * 2000);
    const totalRooms = 30 + Math.floor(Math.random() * 40);
    const availableRooms = Math.floor(totalRooms * (0.4 + Math.random() * 0.5));
    hotels.push({
      name: `${template.name} ${currentDate.getFullYear()}`,
      location: template.location,
      address: `${Math.floor(Math.random() * 999) + 1} ${template.location} Street, ${template.location}`,
      price: price,
      rating: 4.0 + Math.random() * 1.0,
      amenities: ["WiFi", "Pool", "Restaurant", "Room Service", "Gym"],
      availableRooms: availableRooms,
      totalRooms: totalRooms,
      roomType: template.roomType,
      images: [`hotel${i + 1}.jpg`],
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}

/**
 * Setup Swap Buttons for Flight and Train Search Forms
 */
function setupSwapButtons() {
  // Only setup if we're on a page that has search forms
  const hasFlightForm = document.getElementById('flightSource') && document.getElementById('flightDestination');
  const hasTrainForm = document.getElementById('trainSource') && document.getElementById('trainDestination');
  
  if (!hasFlightForm && !hasTrainForm) {
    return; // Skip setup on pages without search forms
  }
  
  // Setup flight swap button
  const flightSwapBtn = document.getElementById('swapFlightBtn');
  if (flightSwapBtn && hasFlightForm) {
    flightSwapBtn.addEventListener('click', function() {
      swapFields('flightSource', 'flightDestination');
    });
  }
  
  // Setup train swap button
  const trainSwapBtn = document.getElementById('swapTrainBtn');
  if (trainSwapBtn && hasTrainForm) {
    trainSwapBtn.addEventListener('click', function() {
      swapFields('trainSource', 'trainDestination');
    });
  }
}

/**
 * Swap values between two input fields
 * @param {string} sourceId - ID of the source input field
 * @param {string} destinationId - ID of the destination input field
 */
function swapFields(sourceId, destinationId) {
  console.log('Swapping fields:', sourceId, destinationId);
  
  const sourceField = document.getElementById(sourceId);
  const destinationField = document.getElementById(destinationId);
  
  console.log('Source field found:', sourceField);
  console.log('Destination field found:', destinationField);
  
  if (sourceField && destinationField) {
    const tempValue = sourceField.value;
    sourceField.value = destinationField.value;
    destinationField.value = tempValue;
    
    console.log('Values swapped successfully');
    
    // Add a small animation effect to show the swap
    const swapBtn = sourceId.includes('flight') ? 
      document.getElementById('swapFlightBtn') : 
      document.getElementById('swapTrainBtn');
    
    if (swapBtn) {
      swapBtn.style.transition = 'transform 0.3s ease';
      swapBtn.style.transform = 'rotate(180deg)';
      setTimeout(() => {
        swapBtn.style.transform = 'rotate(0deg)';
      }, 300);
    }
  } else {
    console.log('One or both fields not found!');
  }
}

