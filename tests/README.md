# Online Booking System Tests

This directory contains tests for the Online Booking System project.

## Test Types

1. **Unit Tests**: Tests individual components of the backend API
2. **Integration Tests**: Tests the integration between frontend and backend

## Prerequisites

Before running the tests, make sure you have:

1. Node.js and npm installed
2. Backend server running on port 3000
3. Frontend server running on port 8000

## Setup

Install the test dependencies:

```bash
npm install
```

## Running Tests

### Unit Tests

To run the unit tests for the backend API:

```bash
npm run test:unit
```

### Integration Tests

To run the integration tests between frontend and backend:

```bash
npm run test:integration
```

### All Tests

To run all tests:

```bash
npm test
```

## Test Coverage

The tests cover the following functionality:

### Unit Tests
- API health check
- User authentication (register, login)
- Search functionality (flights, trains, hotels)
- Booking functionality (create, view, cancel)
- User profile management

### Integration Tests
- Homepage loading
- User registration and login flow
- Flight search functionality
- Hotel search functionality
- Train search functionality
- Booking history display
- Contact form submission

## Notes

- The integration tests use Puppeteer to simulate user interactions with the frontend
- The unit tests use Chai HTTP to make requests to the backend API
- Some tests may be skipped if the required data is not available (e.g., no flights found)
- Test user accounts are created automatically for testing purposes

