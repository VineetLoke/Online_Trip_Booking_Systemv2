/*
 * Admin Panel JavaScript
 * Top-level functions must be defined before DOMContentLoaded
 */

// Explicitly define adminLogout in global scope first
window.adminLogout = function(e) {
  // Prevent default and stop event bubbling
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  console.log('Admin logout called'); // Debug line

  // Show toast, then clear and redirect
  const toastEl = document.getElementById('logoutToast');
  if (toastEl && typeof bootstrap !== 'undefined') {
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
    setTimeout(() => {
      // Remove both admin and regular user tokens/users to fully logout
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/pages/admin/login.html';
    }, 800);
  } else {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/admin/login.html';
  }
};

// Mark this as an admin page so site-wide scripts can avoid interfering
window.isAdminPage = true;

// Use the shared API base URL exposed by main.js (defined in frontend/js/main.js)
// Do not redeclare API_BASE_URL here to avoid SyntaxError when main.js already defines it.

document.addEventListener('DOMContentLoaded', function() {
  // Check if admin is logged in
  if (!localStorage.getItem('adminToken')) {
    window.location.href = 'login.html';
    return;
  }

  // Set admin name
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  document.getElementById('adminName').textContent = adminUser.name || 'Admin';

  // Handle logout buttons first (before any async operations)
  setupLogoutButtons();

  // Initialize dashboard
  loadDashboardData();
  loadUsers();
  loadFlights();
  loadTrains();
  loadHotels();
  loadBookings();
  loadReports();

  // Start real-time event stream for admin logs
  startAdminEventStream();

  // Handle navigation
  document.querySelectorAll('.nav-link[data-section]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.getAttribute('data-section');
      showSection(section);
    });
  });
});

// Setup logout buttons
function setupLogoutButtons() {
  const logoutEl = document.getElementById('logoutBtn');
  const logoutEl2 = document.getElementById('logoutBtn2');
  
  if (logoutEl) {
    // Remove any existing listeners
    logoutEl.removeEventListener('click', window.adminLogout);
    // Add new listener
    logoutEl.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Logout button 1 clicked');
      window.adminLogout(e);
    });
  }
  
  if (logoutEl2) {
    // Remove any existing listeners
    logoutEl2.removeEventListener('click', window.adminLogout);
    // Add new listener
    logoutEl2.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Logout button 2 clicked');
      window.adminLogout(e);
    });
  }
}

// Centralized response checker: if API returns 401, force logout
function handleAuthResponse(response) {
  if (response.status === 401) {
    // Use adminLogout to ensure admin-specific cleanup and redirect
    if (typeof window.adminLogout === 'function') {
      window.adminLogout();
    } else {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = 'login.html';
    }
    throw new Error('Unauthorized');
  }
  return response;
}

function showSection(sectionName) {
  // Hide all sections
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });

  // Remove active class from all nav links
  document.querySelectorAll('.nav-link[data-section]').forEach(link => {
    link.classList.remove('active');
  });

  // Show selected section
  document.getElementById(sectionName).classList.add('active');
  document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

  // Update page title
  const titles = {
    dashboard: 'Dashboard',
    users: 'User Information',
    flights: 'Flight Information',
    trains: 'Train Information',
    hotels: 'Hotel Information',
    bookings: 'Booking Management',
    reports: 'Reports & Analytics'
  };
  document.getElementById('pageTitle').textContent = titles[sectionName] || 'Admin Panel';
}

async function loadDashboardData() {
  try {
    const [usersRes, flightsRes, trainsRes, hotelsRes, bookingsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/admin/users`, { headers: getAuthHeaders() }),
      fetch(`${API_BASE_URL}/admin/flights`, { headers: getAuthHeaders() }),
      fetch(`${API_BASE_URL}/admin/trains`, { headers: getAuthHeaders() }),
      fetch(`${API_BASE_URL}/admin/hotels`, { headers: getAuthHeaders() }),
      fetch(`${API_BASE_URL}/admin/bookings`, { headers: getAuthHeaders() })
    ]);

    // If any response is unauthorized, handleAuthResponse will logout
    handleAuthResponse(usersRes);
    handleAuthResponse(flightsRes);
    handleAuthResponse(trainsRes);
    handleAuthResponse(hotelsRes);
    handleAuthResponse(bookingsRes);

    const users = await usersRes.json();
    const flights = await flightsRes.json();
    const trains = await trainsRes.json();
    const hotels = await hotelsRes.json();
    const bookings = await bookingsRes.json();

    // Update stats
    document.getElementById('totalUsers').textContent = users.users?.length || 0;
    document.getElementById('totalFlights').textContent = flights.flights?.length || 0;
    document.getElementById('totalTrains').textContent = trains.trains?.length || 0;
    document.getElementById('totalHotels').textContent = hotels.hotels?.length || 0;

    // Show recent bookings
    displayRecentBookings(bookings.bookings?.slice(0, 5) || []);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

function displayRecentBookings(bookings) {
  const container = document.getElementById('recentBookings');
  
  if (!container) {
    console.error('Recent bookings container not found');
    return;
  }
  
  if (bookings.length === 0) {
    container.innerHTML = '<p class="text-muted text-center py-4">No recent bookings</p>';
    return;
  }

  const html = `
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>User</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${bookings.map(booking => `
            <tr>
              <td>${booking._id?.substring(0, 8)}...</td>
              <td><span class="badge bg-primary">${booking.bookingType}</span></td>
              <td>${booking.userId?.name || 'N/A'}</td>
              <td>₹${booking.totalAmount}</td>
              <td><span class="badge bg-${getStatusColor(booking.status)}">${booking.status}</span></td>
              <td>${new Date(booking.bookingDate).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  container.innerHTML = html;
}

async function loadUsers() {
  const container = document.getElementById('usersTable');
  if (!container) return;
  
  // Show loading spinner
  container.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Loading users...</p></div>';
  
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users`, { headers: getAuthHeaders() });
    handleAuthResponse(response);
    const data = await response.json();
    displayUsers(data.users || []);
  } catch (error) {
    console.error('Error loading users:', error);
    container.innerHTML = '<p class="text-danger text-center py-4">Error loading users</p>';
  }
}

function displayUsers(users) {
  const container = document.getElementById('usersTable');
  
  if (users.length === 0) {
    container.innerHTML = '<p class="text-muted text-center py-4">No users found</p>';
    return;
  }

  const html = `
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Joined</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(user => `
            <tr>
              <td>${user.name}</td>
              <td>${user.email}</td>
              <td>${user.phone || 'N/A'}</td>
              <td>${new Date(user.createdAt).toLocaleDateString()}</td>
              <td><span class="badge bg-success">Active</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  container.innerHTML = html;
}

async function loadFlights() {
  const container = document.getElementById('flightsTable');
  if (!container) return;
  
  // Show loading spinner
  container.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Loading flights...</p></div>';
  
  try {
    const response = await fetch(`${API_BASE_URL}/admin/flights`, { headers: getAuthHeaders() });
    handleAuthResponse(response);
    const data = await response.json();
    displayFlights(data.flights || []);
  } catch (error) {
    console.error('Error loading flights:', error);
    container.innerHTML = '<p class="text-danger text-center py-4">Error loading flights</p>';
  }
}

function displayFlights(flights) {
  const container = document.getElementById('flightsTable');
  
  if (flights.length === 0) {
    container.innerHTML = '<p class="text-muted text-center py-4">No flights found</p>';
    return;
  }

  const html = `
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Flight Number</th>
            <th>Airline</th>
            <th>Route</th>
            <th>Departure</th>
            <th>Price</th>
            <th>Available Seats</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${flights.map(flight => `
            <tr>
              <td><strong>${flight.flightNumber}</strong></td>
              <td>${flight.airline}</td>
              <td>${flight.source} → ${flight.destination}</td>
              <td>${new Date(flight.departureTime).toLocaleString()}</td>
              <td>₹${flight.price}</td>
              <td>${flight.availableSeats || 'N/A'}</td>
              <td><span class="badge bg-${flight.status === 'active' ? 'success' : 'secondary'}">${flight.status || 'Active'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  container.innerHTML = html;
}

async function loadTrains() {
  const container = document.getElementById('trainsTable');
  if (!container) return;
  
  // Show loading spinner
  container.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Loading trains...</p></div>';
  
  try {
    const response = await fetch(`${API_BASE_URL}/admin/trains`, { headers: getAuthHeaders() });
    handleAuthResponse(response);
    const data = await response.json();
    displayTrains(data.trains || []);
  } catch (error) {
    console.error('Error loading trains:', error);
    container.innerHTML = '<p class="text-danger text-center py-4">Error loading trains</p>';
  }
}

function displayTrains(trains) {
  const container = document.getElementById('trainsTable');
  
  if (trains.length === 0) {
    container.innerHTML = '<p class="text-muted text-center py-4">No trains found</p>';
    return;
  }

  const html = `
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Train Number</th>
            <th>Train Name</th>
            <th>Route</th>
            <th>Departure</th>
            <th>Price</th>
            <th>Available Seats</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${trains.map(train => `
            <tr>
              <td><strong>${train.trainNumber}</strong></td>
              <td>${train.trainName}</td>
              <td>${train.source} → ${train.destination}</td>
              <td>${new Date(train.departureTime).toLocaleString()}</td>
              <td>₹${train.price}</td>
              <td>${train.availableSeats || 'N/A'}</td>
              <td><span class="badge bg-${train.status === 'active' ? 'success' : 'secondary'}">${train.status || 'Active'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  container.innerHTML = html;
}

async function loadHotels() {
  const container = document.getElementById('hotelsTable');
  if (!container) return;
  
  // Show loading spinner
  container.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Loading hotels...</p></div>';
  
  try {
    const response = await fetch(`${API_BASE_URL}/admin/hotels`, { headers: getAuthHeaders() });
    handleAuthResponse(response);
    const data = await response.json();
    displayHotels(data.hotels || []);
  } catch (error) {
    console.error('Error loading hotels:', error);
    container.innerHTML = '<p class="text-danger text-center py-4">Error loading hotels</p>';
  }
}

function displayHotels(hotels) {
  const container = document.getElementById('hotelsTable');
  
  if (hotels.length === 0) {
    container.innerHTML = '<p class="text-muted text-center py-4">No hotels found</p>';
    return;
  }

  const html = `
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Hotel Name</th>
            <th>Location</th>
            <th>Room Type</th>
            <th>Price</th>
            <th>Available Rooms</th>
            <th>Total Rooms</th>
            <th>Rating</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${hotels.map(hotel => `
            <tr>
              <td><strong>${hotel.name}</strong></td>
              <td>${hotel.location}</td>
              <td>${hotel.roomType}</td>
              <td>₹${hotel.price}</td>
              <td>${hotel.availableRooms || 'N/A'}</td>
              <td>${hotel.totalRooms}</td>
              <td>${hotel.rating ? '★'.repeat(Math.floor(hotel.rating)) + ' (' + hotel.rating + ')' : 'N/A'}</td>
              <td><span class="badge bg-${hotel.status === 'active' ? 'success' : 'secondary'}">${hotel.status || 'Active'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  container.innerHTML = html;
}

async function loadBookings() {
  const container = document.getElementById('bookingsTable');
  if (!container) return;
  
  // Show loading spinner
  container.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Loading bookings...</p></div>';
  
  try {
    const response = await fetch(`${API_BASE_URL}/admin/bookings`, { headers: getAuthHeaders() });
    handleAuthResponse(response);
    const data = await response.json();
    // Cache bookings for quick lookup in detail modal
    window.adminBookingsCache = {};
    (data.bookings || []).forEach(b => {
      window.adminBookingsCache[b._id] = b;
    });
    displayBookings(data.bookings || []);
  } catch (error) {
    console.error('Error loading bookings:', error);
    container.innerHTML = '<p class="text-danger text-center py-4">Error loading bookings</p>';
  }
}

function displayBookings(bookings) {
  const container = document.getElementById('bookingsTable');
  
  if (bookings.length === 0) {
    container.innerHTML = '<p class="text-muted text-center">No bookings found</p>';
    return;
  }

  const html = `
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Type</th>
            <th>User</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${bookings.map(booking => `
            <tr>
              <td>${booking._id?.substring(0, 8)}...</td>
              <td><span class="badge bg-primary">${booking.bookingType}</span></td>
              <td>${booking.userId?.name || 'N/A'}</td>
              <td>₹${booking.totalAmount}</td>
              <td><span class="badge bg-${getStatusColor(booking.status)}">${booking.status}</span></td>
              <td>${new Date(booking.bookingDate).toLocaleDateString()}</td>
              <td>
                <button class="btn btn-sm btn-outline-info" onclick="showBookingDetails('${booking._id}')">
                  <i class="fas fa-eye"></i> View
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  container.innerHTML = html;
}

// Show booking details modal
async function showBookingDetails(bookingId) {
  try {
    // Try cache first (admin bookings endpoint already returns full booking objects)
    let booking = window.adminBookingsCache && window.adminBookingsCache[bookingId];
    if (!booking) {
      // Fallback: call user booking endpoint (may be restricted) and extract booking
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, { headers: getAuthHeaders() });
      handleAuthResponse(response);
      if (!response.ok) throw new Error('Failed to fetch booking details');
      const payload = await response.json();
      booking = payload.booking || payload;
    }

    const content = document.getElementById('bookingDetailsContent');
  const html = `
      <dl class="row">
        <dt class="col-sm-4">Booking ID</dt><dd class="col-sm-8">${booking._id}</dd>
        <dt class="col-sm-4">Type</dt><dd class="col-sm-8">${booking.bookingType}</dd>
        <dt class="col-sm-4">User</dt><dd class="col-sm-8">${booking.userId?.name || 'N/A'} (${booking.userId?.email || ''})</dd>
        <dt class="col-sm-4">Total Amount</dt><dd class="col-sm-8">₹${booking.totalAmount}</dd>
        <dt class="col-sm-4">Status</dt><dd class="col-sm-8">${booking.status}</dd>
        <dt class="col-sm-4">Booking Date</dt><dd class="col-sm-8">${new Date(booking.bookingDate).toLocaleString()}</dd>
    <dt class="col-sm-4">Details</dt><dd class="col-sm-8"><pre>${JSON.stringify(booking.trip || booking, null, 2)}</pre></dd>
      </dl>
    `;
    content.innerHTML = html;

    const modalEl = document.getElementById('bookingDetailsModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  } catch (error) {
    console.error('Error loading booking details:', error);
    const content = document.getElementById('bookingDetailsContent');
    content.innerHTML = '<p class="text-danger">Unable to load booking details.</p>';
  }
}

// Real-time event stream (SSE)
function startAdminEventStream() {
  try {
    // Avoid using admin token for SSE; EventSource doesn't send custom headers. Our server allows CORS and public stream.
    const source = new EventSource(`${API_BASE_URL}/admin/stream`);
    source.addEventListener('open', () => console.log('[SSE] connected'));
    source.addEventListener('error', (e) => console.warn('[SSE] error', e));

    const logContainer = ensureLogContainer();

    const renderLog = (entry) => {
      const el = document.createElement('div');
      el.className = 'border-bottom py-2';
      el.innerHTML = `
        <div class="d-flex justify-content-between">
          <div>
            <span class="badge bg-secondary me-2">${entry.event}</span>
            <strong>${entry.title}</strong>
            <div class="small text-muted">${entry.subtitle || ''}</div>
          </div>
          <small class="text-muted">${new Date(entry.timestamp).toLocaleTimeString()}</small>
        </div>`;
      logContainer.prepend(el);
    };

    // User registrations
    source.addEventListener('user:registered', (ev) => {
      const data = JSON.parse(ev.data);
      const p = data.payload;
      renderLog({
        event: 'User',
        title: `${p.name} registered`,
        subtitle: p.email,
        timestamp: data.timestamp
      });
      // Optionally refresh counts
      refreshUsers();
      loadDashboardData();
    });

    // Bookings
    source.addEventListener('booking:created', (ev) => {
      const data = JSON.parse(ev.data);
      const p = data.payload;
      renderLog({
        event: 'Booking',
        title: `${p.type.toUpperCase()} booking - ₹${p.amount}`,
        subtitle: `${p.user.name} (${p.user.email})`,
        timestamp: data.timestamp
      });
      // Update UI sections
      refreshBookings();
      loadDashboardData();
    });
  } catch (err) {
    console.warn('SSE not supported or failed:', err);
  }
}

function ensureLogContainer() {
  // Create a lightweight log panel at the end of dashboard section if not present
  let container = document.getElementById('adminLiveLogs');
  if (!container) {
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
      const wrapper = document.createElement('div');
      wrapper.className = 'container-fluid mt-4';
      wrapper.innerHTML = `
        <div class="row">
          <div class="col-12">
            <div class="table-responsive" id="adminLiveLogs">
              <div class="p-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Live Activity</h5>
                <span class="text-muted small">Real-time user registrations and bookings</span>
              </div>
              <div class="p-3" id="adminLiveLogsBody"></div>
            </div>
          </div>
        </div>`;
      dashboard.appendChild(wrapper);
      container = document.getElementById('adminLiveLogsBody');
    }
  } else {
    container = document.getElementById('adminLiveLogsBody') || container;
  }
  return container;
}

// Utility functions
function getAuthHeaders() {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

function getStatusColor(status) {
  const colors = {
    'confirmed': 'success',
    'pending': 'warning',
    'cancelled': 'danger',
    'failed': 'danger'
  };
  return colors[status] || 'secondary';
}

// Note: admin-specific logout behavior is implemented by `window.adminLogout` above.
// We avoid exporting another global `logout` here to prevent overwriting the site's
// main `logout` function defined in `main.js`.

// Refresh functions
function refreshUsers() {
  loadUsers();
}

function refreshFlights() {
  loadFlights();
}

function refreshTrains() {
  loadTrains();
}

function refreshHotels() {
  loadHotels();
}

function refreshBookings() {
  loadBookings();
}

function refreshReports() {
  loadReports();
}

// Analytics functions
async function loadReports() {
  try {
    // Load overview stats
    await loadOverviewStats();
    
    // Load all charts
    await Promise.all([
      loadBookingTypesChart(),
      loadBookingStatusChart(),
      loadFlightRoutesChart(),
      loadTrainRoutesChart(),
      loadHotelLocationsChart(),
      loadRevenueChart()
    ]);
  } catch (error) {
    console.error('Error loading reports:', error);
  }
}

async function loadOverviewStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/overview`, { 
      headers: getAuthHeaders() 
    });
    handleAuthResponse(response);
    const data = await response.json();
    
    // Update stats cards
    document.getElementById('totalRevenue').textContent = `₹${data.totalRevenue.toLocaleString()}`;
    document.getElementById('confirmedBookings').textContent = data.confirmedBookings;
    document.getElementById('pendingBookings').textContent = data.pendingBookings;
    document.getElementById('todayBookings').textContent = data.todayBookings;
  } catch (error) {
    console.error('Error loading overview stats:', error);
  }
}

async function loadBookingTypesChart() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/booking-types`, { 
      headers: getAuthHeaders() 
    });
    handleAuthResponse(response);
    const data = await response.json();
    
    const ctx = document.getElementById('bookingTypesChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.bookingTypesChart) {
      window.bookingTypesChart.destroy();
    }
    
    window.bookingTypesChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.bookingTypes.map(item => item._id.charAt(0).toUpperCase() + item._id.slice(1)),
        datasets: [{
          data: data.bookingTypes.map(item => item.count),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
          hoverBackgroundColor: ['#FF6384CC', '#36A2EBCC', '#FFCE56CC', '#4BC0C0CC']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error loading booking types chart:', error);
  }
}

async function loadBookingStatusChart() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/booking-status`, { 
      headers: getAuthHeaders() 
    });
    handleAuthResponse(response);
    const data = await response.json();
    
    const ctx = document.getElementById('bookingStatusChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.bookingStatusChart) {
      window.bookingStatusChart.destroy();
    }
    
    const statusColors = {
      'confirmed': '#28a745',
      'pending': '#ffc107',
      'cancelled': '#dc3545',
      'failed': '#6c757d'
    };
    
    window.bookingStatusChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.bookingStatus.map(item => item._id.charAt(0).toUpperCase() + item._id.slice(1)),
        datasets: [{
          data: data.bookingStatus.map(item => item.count),
          backgroundColor: data.bookingStatus.map(item => statusColors[item._id] || '#6c757d')
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error loading booking status chart:', error);
  }
}

async function loadFlightRoutesChart() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/flight-routes`, { 
      headers: getAuthHeaders() 
    });
    handleAuthResponse(response);
    const data = await response.json();
    
    const ctx = document.getElementById('flightRoutesChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.flightRoutesChart) {
      window.flightRoutesChart.destroy();
    }
    
    window.flightRoutesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.flightRoutes.map(item => item._id.route),
        datasets: [{
          label: 'Bookings',
          data: data.flightRoutes.map(item => item.count),
          backgroundColor: '#36A2EB',
          borderColor: '#36A2EB',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  } catch (error) {
    console.error('Error loading flight routes chart:', error);
  }
}

async function loadTrainRoutesChart() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/train-routes`, { 
      headers: getAuthHeaders() 
    });
    handleAuthResponse(response);
    const data = await response.json();
    
    const ctx = document.getElementById('trainRoutesChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.trainRoutesChart) {
      window.trainRoutesChart.destroy();
    }
    
    window.trainRoutesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.trainRoutes.map(item => item._id.route),
        datasets: [{
          label: 'Bookings',
          data: data.trainRoutes.map(item => item.count),
          backgroundColor: '#4BC0C0',
          borderColor: '#4BC0C0',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  } catch (error) {
    console.error('Error loading train routes chart:', error);
  }
}

async function loadHotelLocationsChart() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/hotel-locations`, { 
      headers: getAuthHeaders() 
    });
    handleAuthResponse(response);
    const data = await response.json();
    
    const ctx = document.getElementById('hotelLocationsChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.hotelLocationsChart) {
      window.hotelLocationsChart.destroy();
    }
    
    window.hotelLocationsChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.hotelLocations.map(item => item._id),
        datasets: [{
          data: data.hotelLocations.map(item => item.count),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
          hoverBackgroundColor: ['#FF6384CC', '#36A2EBCC', '#FFCE56CC', '#4BC0C0CC', '#9966FFCC', '#FF9F40CC']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error loading hotel locations chart:', error);
  }
}

async function loadRevenueChart() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/monthly-revenue`, { 
      headers: getAuthHeaders() 
    });
    handleAuthResponse(response);
    const data = await response.json();
    
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.revenueChart) {
      window.revenueChart.destroy();
    }
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    window.revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.monthlyRevenue.map(item => 
          `${monthNames[item._id.month - 1]} ${item._id.year}`
        ),
        datasets: [{
          label: 'Revenue (₹)',
          data: data.monthlyRevenue.map(item => item.revenue),
          borderColor: '#28a745',
          backgroundColor: '#28a74520',
          borderWidth: 2,
          fill: true,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '₹' + value.toLocaleString();
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  } catch (error) {
    console.error('Error loading revenue chart:', error);
  }
}

// Note: Admin panel is now read-only for data viewing and booking management only
// No CRUD operations are available for flights, trains, hotels, or users
