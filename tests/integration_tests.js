/**
 * Integration Tests for Online Booking System
 * 
 * This file contains integration tests that verify the frontend and backend
 * work together correctly. These tests use Puppeteer to simulate user interactions
 * with the frontend and verify that the backend responds correctly.
 */

const puppeteer = require('puppeteer');
const { expect } = require('chai');

// Configuration
const FRONTEND_URL = 'http://localhost:8000';
const API_URL = 'http://localhost:3000/api';

// Test user credentials
const TEST_USER = {
  email: 'integration@example.com',
  password: 'Test@123',
  name: 'Integration Test User',
  phone: '9876543210'
};

describe('Online Booking System Integration Tests', function() {
  // Increase timeout for Puppeteer tests
  this.timeout(30000);
  
  let browser;
  let page;
  
  // Setup - runs before all tests
  before(async () => {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Create a new page
    page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Create test user via API if needed
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_USER)
      });
      
      if (!response.ok && response.status !== 409) { // 409 means user already exists
        console.warn('Failed to create test user:', await response.text());
      }
    } catch (error) {
      console.warn('Error creating test user:', error.message);
    }
  });
  
  // Teardown - runs after all tests
  after(async () => {
    await browser.close();
  });
  
  // Test: Homepage loads correctly
  it('should load the homepage', async () => {
    await page.goto(FRONTEND_URL);
    
    // Check page title
    const title = await page.title();
    expect(title).to.include('Online Booking System');
    
    // Check for main elements
    const heroText = await page.$eval('h1', el => el.textContent);
    expect(heroText).to.include('Book Your Perfect Trip');
    
    // Check for booking options
    const flightsButton = await page.$('a[href="pages/flights.html"]');
    expect(flightsButton).to.not.be.null;
    
    const trainsButton = await page.$('a[href="pages/trains.html"]');
    expect(trainsButton).to.not.be.null;
    
    const hotelsButton = await page.$('a[href="pages/hotels.html"]');
    expect(hotelsButton).to.not.be.null;
  });
  
  // Test: User Registration and Login
  it('should register a new user and login', async () => {
    await page.goto(FRONTEND_URL);
    
    // Generate unique email for this test
    const uniqueEmail = `test${Date.now()}@example.com`;
    
    // Click register button
    await page.click('button[data-bs-target="#registerModal"]');
    
    // Wait for modal to appear
    await page.waitForSelector('#registerModal.show');
    
    // Fill registration form
    await page.type('#registerName', 'Test User');
    await page.type('#registerEmail', uniqueEmail);
    await page.type('#registerPhone', '1234567890');
    await page.type('#registerPassword', 'Test@123');
    await page.click('#agreeTerms');
    
    // Submit form
    await Promise.all([
      page.click('#registerForm button[type="submit"]'),
      page.waitForResponse(response => 
        response.url().includes('/auth/register') && response.status() === 201
      ).catch(() => {
        // If registration fails (e.g., user already exists), we'll test login instead
        console.log('Registration response not received, will test login');
      })
    ]);
    
    // Check if user dropdown is visible (indicating successful login)
    try {
      await page.waitForSelector('#userDropdown:not(.d-none)', { timeout: 5000 });
      const userName = await page.$eval('#userName', el => el.textContent);
      expect(userName).to.not.be.empty;
    } catch (error) {
      // If registration didn't auto-login, try explicit login
      console.log('Testing explicit login flow');
      
      // Click login button
      await page.click('button[data-bs-target="#loginModal"]');
      
      // Wait for modal to appear
      await page.waitForSelector('#loginModal.show');
      
      // Fill login form
      await page.type('#loginEmail', uniqueEmail);
      await page.type('#loginPassword', 'Test@123');
      
      // Submit form
      await Promise.all([
        page.click('#loginForm button[type="submit"]'),
        page.waitForResponse(response => 
          response.url().includes('/auth/login')
        ).catch(() => {
          console.log('Login response not received');
        })
      ]);
      
      // Check if user dropdown is visible
      await page.waitForSelector('#userDropdown:not(.d-none)', { timeout: 5000 });
      const userName = await page.$eval('#userName', el => el.textContent);
      expect(userName).to.not.be.empty;
    }
  });
  
  // Test: Flight Search
  it('should search for flights', async () => {
    await page.goto(`${FRONTEND_URL}/pages/flights.html`);
    
    // Fill search form
    await page.type('#flightSource', 'Mumbai');
    await page.type('#flightDestination', 'Delhi');
    
    // Set date (current date + 7 days)
    const date = new Date();
    date.setDate(date.getDate() + 7);
    const formattedDate = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    await page.$eval('#flightDate', (el, value) => el.value = value, formattedDate);
    
    // Submit search form
    await Promise.all([
      page.click('#flightSearchForm button[type="submit"]'),
      page.waitForResponse(response => 
        response.url().includes('/search/flights')
      ).catch(() => {
        console.log('Flight search response not received');
      })
    ]);
    
    // Wait for results to load (this is a mock, so we're checking for the container)
    await page.waitForSelector('#searchResults:not(:empty)', { timeout: 10000 });
    
    // Check if results are displayed
    const resultsText = await page.$eval('#searchResults', el => el.textContent);
    
    // Either we have flight results or a "no flights found" message
    expect(resultsText).to.not.include('Search for flights to see results here');
  });
  
  // Test: Hotel Search
  it('should search for hotels', async () => {
    await page.goto(`${FRONTEND_URL}/pages/hotels.html`);
    
    // Fill search form
    await page.type('#hotelLocation', 'Mumbai');
    
    // Set check-in date (current date + 7 days)
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 7);
    const formattedCheckInDate = checkInDate.toISOString().split('T')[0];
    
    // Set check-out date (current date + 10 days)
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 10);
    const formattedCheckOutDate = checkOutDate.toISOString().split('T')[0];
    
    await page.$eval('#hotelCheckIn', (el, value) => el.value = value, formattedCheckInDate);
    await page.$eval('#hotelCheckOut', (el, value) => el.value = value, formattedCheckOutDate);
    
    // Submit search form
    await Promise.all([
      page.click('#hotelSearchForm button[type="submit"]'),
      page.waitForResponse(response => 
        response.url().includes('/search/hotels')
      ).catch(() => {
        console.log('Hotel search response not received');
      })
    ]);
    
    // Wait for results to load
    await page.waitForSelector('#searchResults:not(:empty)', { timeout: 10000 });
    
    // Check if results are displayed
    const resultsText = await page.$eval('#searchResults', el => el.textContent);
    
    // Either we have hotel results or a "no hotels found" message
    expect(resultsText).to.not.include('Search for hotels to see results here');
  });
  
  // Test: Train Search
  it('should search for trains', async () => {
    await page.goto(`${FRONTEND_URL}/pages/trains.html`);
    
    // Fill search form
    await page.type('#trainSource', 'Mumbai');
    await page.type('#trainDestination', 'Delhi');
    
    // Set date (current date + 7 days)
    const date = new Date();
    date.setDate(date.getDate() + 7);
    const formattedDate = date.toISOString().split('T')[0];
    
    await page.$eval('#trainDate', (el, value) => el.value = value, formattedDate);
    
    // Submit search form
    await Promise.all([
      page.click('#trainSearchForm button[type="submit"]'),
      page.waitForResponse(response => 
        response.url().includes('/search/trains')
      ).catch(() => {
        console.log('Train search response not received');
      })
    ]);
    
    // Wait for results to load
    await page.waitForSelector('#searchResults:not(:empty)', { timeout: 10000 });
    
    // Check if results are displayed
    const resultsText = await page.$eval('#searchResults', el => el.textContent);
    
    // Either we have train results or a "no trains found" message
    expect(resultsText).to.not.include('Search for trains to see results here');
  });
  
  // Test: View Booking History
  it('should display booking history for logged in user', async () => {
    // First ensure we're logged in
    await page.goto(FRONTEND_URL);
    
    // Check if already logged in
    const isLoggedIn = await page.evaluate(() => {
      return !document.querySelector('#userDropdown').classList.contains('d-none');
    });
    
    if (!isLoggedIn) {
      // Login
      await page.click('button[data-bs-target="#loginModal"]');
      await page.waitForSelector('#loginModal.show');
      await page.type('#loginEmail', TEST_USER.email);
      await page.type('#loginPassword', TEST_USER.password);
      await Promise.all([
        page.click('#loginForm button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle0' })
      ]);
    }
    
    // Navigate to bookings page
    await page.goto(`${FRONTEND_URL}/pages/bookings.html`);
    
    // Wait for bookings to load
    await page.waitForSelector('#bookingTabsContent', { timeout: 10000 });
    
    // Check if bookings tab content is displayed
    const bookingsContent = await page.$eval('#bookingTabsContent', el => el.textContent);
    expect(bookingsContent).to.not.be.empty;
    
    // Check if we have tabs for different booking statuses
    const upcomingTab = await page.$('#upcoming-tab');
    expect(upcomingTab).to.not.be.null;
    
    const completedTab = await page.$('#completed-tab');
    expect(completedTab).to.not.be.null;
    
    const cancelledTab = await page.$('#cancelled-tab');
    expect(cancelledTab).to.not.be.null;
  });
  
  // Test: Contact Form
  it('should submit the contact form', async () => {
    await page.goto(`${FRONTEND_URL}/pages/contact.html`);
    
    // Fill contact form
    await page.type('#name', 'Test User');
    await page.type('#email', 'test@example.com');
    await page.type('#subject', 'Integration Test');
    await page.type('#message', 'This is a test message from the integration test suite.');
    await page.click('#newsletter');
    
    // Submit form
    await page.click('#contactForm button[type="submit"]');
    
    // Wait for success modal
    await page.waitForSelector('#messageSentModal.show', { timeout: 10000 });
    
    // Check success message
    const modalText = await page.$eval('#messageSentModal .modal-body', el => el.textContent);
    expect(modalText).to.include('Message Sent Successfully');
  });
});

