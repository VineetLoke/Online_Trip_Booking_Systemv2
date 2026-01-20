/**
 * Online Booking System - Utilities
 */

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
        userNameElement.textContent = user.name || 'User';
      }
    } else {
      // Show auth buttons, hide user dropdown
      authButtons.classList.remove('d-none');
      userDropdown.classList.add('d-none');
    }
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

// Make functions globally available
window.showAlert = showAlert;
window.getDurationString = getDurationString;
window.trapFocus = trapFocus;
window.isLoggedIn = isLoggedIn;
window.showLoginPrompt = showLoginPrompt;
window.updateAuthUI = updateAuthUI;
window.checkAuthStatus = checkAuthStatus;
