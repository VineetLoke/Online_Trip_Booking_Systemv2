const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000/api';
let adminToken = '';

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@travelease.com',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin login successful');
      console.log('Admin data:', data.admin);
      adminToken = data.token;
      return true;
    } else {
      console.log('❌ Admin login failed:', data.error?.message || data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Admin login error:', error.message);
    return false;
  }
}

async function testAdminEndpoints() {
  if (!adminToken) {
    console.log('❌ No admin token available');
    return;
  }

  const endpoints = [
    '/admin/users',
    '/admin/flights', 
    '/admin/trains',
    '/admin/hotels',
    '/admin/bookings'
  ];

  console.log('\nTesting admin API endpoints...');
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${endpoint}: ${data.count || 0} items`);
      } else {
        console.log(`❌ ${endpoint}: ${data.error?.message || data.message}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

async function runTests() {
  console.log('🔍 Debug Admin Panel Issues\n');
  
  // Test server health
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Server is running:', data.status);
  } catch (error) {
    console.log('❌ Server not accessible:', error.message);
    return;
  }
  
  // Test admin login
  const loginSuccess = await testAdminLogin();
  
  if (loginSuccess) {
    // Test admin endpoints
    await testAdminEndpoints();
  }
  
  console.log('\n📋 Admin Login Details:');
  console.log('URL: http://localhost:3000/frontend/pages/admin/login.html');
  console.log('Email: admin@travelease.com');
  console.log('Password: admin123');
  
  console.log('\n🔧 Expected Frontend Behavior:');
  console.log('1. Login page should accept the above credentials');
  console.log('2. After login, dashboard should load data (no permanent spinners)');
  console.log('3. Both logout buttons should work and redirect to login page');
  console.log('4. Local storage should contain adminToken and adminUser after login');
}

// Run the tests
runTests();
