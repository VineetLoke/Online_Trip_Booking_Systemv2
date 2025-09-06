# Manual Test Cases for Online Booking System

This document outlines manual test cases for the Online Booking System. These tests should be performed to ensure the system functions correctly from a user perspective.

## User Authentication

### TC-UA-001: User Registration
**Description**: Test user registration functionality  
**Preconditions**: User is not logged in  
**Steps**:
1. Navigate to the homepage
2. Click on "Register" button
3. Fill in all required fields with valid data
4. Click "Register" button

**Expected Results**:
- User account is created successfully
- User is automatically logged in
- User dropdown menu appears with the user's name

### TC-UA-002: User Login
**Description**: Test user login functionality  
**Preconditions**: User has a registered account but is not logged in  
**Steps**:
1. Navigate to the homepage
2. Click on "Login" button
3. Enter valid email and password
4. Click "Login" button

**Expected Results**:
- User is logged in successfully
- User dropdown menu appears with the user's name

### TC-UA-003: User Logout
**Description**: Test user logout functionality  
**Preconditions**: User is logged in  
**Steps**:
1. Click on the user dropdown menu
2. Click "Logout" option

**Expected Results**:
- User is logged out successfully
- Login and Register buttons appear

## Flight Booking

### TC-FB-001: Search for Flights
**Description**: Test flight search functionality  
**Preconditions**: None  
**Steps**:
1. Navigate to the Flights page
2. Enter source city/airport
3. Enter destination city/airport
4. Select departure date
5. Select number of passengers
6. Click "Search Flights" button

**Expected Results**:
- Search results are displayed
- Each result shows airline, flight number, departure/arrival times, and price

### TC-FB-002: Book a Flight
**Description**: Test flight booking functionality  
**Preconditions**: User is logged in  
**Steps**:
1. Search for flights (as in TC-FB-001)
2. Select a flight from the results
3. Click "Book Now" button
4. Fill in traveler information
5. Enter payment details
6. Click "Confirm & Pay" button

**Expected Results**:
- Booking confirmation is displayed
- Booking appears in user's booking history

## Train Booking

### TC-TB-001: Search for Trains
**Description**: Test train search functionality  
**Preconditions**: None  
**Steps**:
1. Navigate to the Trains page
2. Enter source city/station
3. Enter destination city/station
4. Select departure date
5. Select class
6. Click "Search Trains" button

**Expected Results**:
- Search results are displayed
- Each result shows train name, number, departure/arrival times, and price

### TC-TB-002: Book a Train
**Description**: Test train booking functionality  
**Preconditions**: User is logged in  
**Steps**:
1. Search for trains (as in TC-TB-001)
2. Select a train from the results
3. Click "Book Now" button
4. Fill in traveler information
5. Enter payment details
6. Click "Confirm & Pay" button

**Expected Results**:
- Booking confirmation is displayed
- Booking appears in user's booking history

## Hotel Booking

### TC-HB-001: Search for Hotels
**Description**: Test hotel search functionality  
**Preconditions**: None  
**Steps**:
1. Navigate to the Hotels page
2. Enter destination city/area
3. Select check-in date
4. Select check-out date
5. Select number of guests
6. Click "Search Hotels" button

**Expected Results**:
- Search results are displayed
- Each result shows hotel name, location, amenities, and price

### TC-HB-002: Book a Hotel
**Description**: Test hotel booking functionality  
**Preconditions**: User is logged in  
**Steps**:
1. Search for hotels (as in TC-HB-001)
2. Select a hotel from the results
3. Click "Book Now" button
4. Fill in guest information
5. Enter payment details
6. Click "Confirm & Pay" button

**Expected Results**:
- Booking confirmation is displayed
- Booking appears in user's booking history

## Booking Management

### TC-BM-001: View Booking History
**Description**: Test viewing booking history  
**Preconditions**: User is logged in and has made at least one booking  
**Steps**:
1. Click on the user dropdown menu
2. Click "My Bookings" option

**Expected Results**:
- Booking history page is displayed
- All user bookings are listed with relevant details

### TC-BM-002: View Booking Details
**Description**: Test viewing booking details  
**Preconditions**: User is logged in and has made at least one booking  
**Steps**:
1. Navigate to booking history page
2. Click "View Details" button for a booking

**Expected Results**:
- Booking details modal is displayed
- All booking information is shown correctly

### TC-BM-003: Cancel Booking
**Description**: Test booking cancellation  
**Preconditions**: User is logged in and has an upcoming booking  
**Steps**:
1. Navigate to booking history page
2. Click "Cancel" button for an upcoming booking
3. Select cancellation reason
4. Click "Confirm Cancellation" button

**Expected Results**:
- Booking is cancelled successfully
- Booking status changes to "Cancelled"
- Booking moves to the "Cancelled" tab

## User Profile

### TC-UP-001: View User Profile
**Description**: Test viewing user profile  
**Preconditions**: User is logged in  
**Steps**:
1. Click on the user dropdown menu
2. Click "My Profile" option

**Expected Results**:
- User profile page is displayed
- User information is shown correctly

### TC-UP-002: Update User Profile
**Description**: Test updating user profile  
**Preconditions**: User is logged in  
**Steps**:
1. Navigate to user profile page
2. Click "Edit Profile" button
3. Update user information
4. Click "Save Changes" button

**Expected Results**:
- User information is updated successfully
- Updated information is displayed on the profile page

## Contact Form

### TC-CF-001: Submit Contact Form
**Description**: Test contact form submission  
**Preconditions**: None  
**Steps**:
1. Navigate to the Contact page
2. Fill in all required fields
3. Click "Send Message" button

**Expected Results**:
- Success message is displayed
- Form is reset

## Responsive Design

### TC-RD-001: Mobile View
**Description**: Test responsive design on mobile devices  
**Preconditions**: None  
**Steps**:
1. Access the website on a mobile device or using browser developer tools (mobile view)
2. Navigate through different pages
3. Test all major functionality

**Expected Results**:
- Website is properly displayed on mobile devices
- All functionality works correctly
- Navigation menu collapses into a hamburger menu

### TC-RD-002: Tablet View
**Description**: Test responsive design on tablet devices  
**Preconditions**: None  
**Steps**:
1. Access the website on a tablet device or using browser developer tools (tablet view)
2. Navigate through different pages
3. Test all major functionality

**Expected Results**:
- Website is properly displayed on tablet devices
- All functionality works correctly
- Layout adjusts appropriately for the screen size

## Cross-Browser Compatibility

### TC-CBC-001: Chrome Compatibility
**Description**: Test website compatibility with Chrome  
**Preconditions**: Chrome browser is installed  
**Steps**:
1. Access the website using Chrome
2. Navigate through different pages
3. Test all major functionality

**Expected Results**:
- Website displays correctly
- All functionality works as expected

### TC-CBC-002: Firefox Compatibility
**Description**: Test website compatibility with Firefox  
**Preconditions**: Firefox browser is installed  
**Steps**:
1. Access the website using Firefox
2. Navigate through different pages
3. Test all major functionality

**Expected Results**:
- Website displays correctly
- All functionality works as expected

### TC-CBC-003: Safari Compatibility
**Description**: Test website compatibility with Safari  
**Preconditions**: Safari browser is installed  
**Steps**:
1. Access the website using Safari
2. Navigate through different pages
3. Test all major functionality

**Expected Results**:
- Website displays correctly
- All functionality works as expected

## Performance

### TC-PF-001: Page Load Time
**Description**: Test page load time  
**Preconditions**: None  
**Steps**:
1. Use browser developer tools to measure page load time for:
   - Homepage
   - Flights page
   - Trains page
   - Hotels page
   - Booking history page

**Expected Results**:
- Pages load within acceptable time limits (< 3 seconds)
- No significant performance issues are observed

### TC-PF-002: Search Response Time
**Description**: Test search response time  
**Preconditions**: None  
**Steps**:
1. Perform searches for:
   - Flights
   - Trains
   - Hotels
2. Measure response time using browser developer tools

**Expected Results**:
- Search results are returned within acceptable time limits (< 5 seconds)
- No significant performance issues are observed

