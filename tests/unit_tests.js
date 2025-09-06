/**
 * Unit Tests for Online Booking System API
 * 
 * This file contains unit tests for the backend API endpoints
 * using Mocha as the test framework and Chai for assertions.
 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

// Configure chai
chai.use(chaiHttp);
chai.should();

// Base URL for API
const API_URL = 'http://localhost:3000/api';

describe('Online Booking System API Tests', () => {
  // Test variables
  let authToken;
  let userId;
  let bookingId;

  // Test user credentials
  const testUser = {
    email: 'test@example.com',
    password: 'Test@123',
    name: 'Test User',
    phone: '1234567890'
  };

  // Before all tests - register a test user
  before((done) => {
    chai.request(API_URL)
      .post('/auth/register')
      .send(testUser)
      .end((err, res) => {
        // If user already exists, try to login
        if (err || res.status !== 201) {
          chai.request(API_URL)
            .post('/auth/login')
            .send({
              email: testUser.email,
              password: testUser.password
            })
            .end((err, res) => {
              if (res.status === 200) {
                authToken = res.body.token;
                userId = res.body.user._id;
              }
              done();
            });
        } else {
          authToken = res.body.token;
          userId = res.body.user._id;
          done();
        }
      });
  });

  // Health Check Test
  describe('GET /health', () => {
    it('should return status 200 and API status', (done) => {
      chai.request(API_URL)
        .get('/health')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('status').eql('ok');
          res.body.should.have.property('message').eql('API is running');
          done();
        });
    });
  });

  // Authentication Tests
  describe('Authentication', () => {
    it('should register a new user', (done) => {
      const newUser = {
        email: `test${Date.now()}@example.com`,
        password: 'Test@123',
        name: 'New Test User',
        phone: '9876543210'
      };

      chai.request(API_URL)
        .post('/auth/register')
        .send(newUser)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('token');
          res.body.should.have.property('user');
          res.body.user.should.have.property('email').eql(newUser.email);
          res.body.user.should.have.property('name').eql(newUser.name);
          done();
        });
    });

    it('should login an existing user', (done) => {
      chai.request(API_URL)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('token');
          res.body.should.have.property('user');
          res.body.user.should.have.property('email').eql(testUser.email);
          // Update auth token
          authToken = res.body.token;
          done();
        });
    });

    it('should not login with invalid credentials', (done) => {
      chai.request(API_URL)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Invalid credentials');
          done();
        });
    });
  });

  // Search Tests
  describe('Search Functionality', () => {
    it('should search for flights', (done) => {
      chai.request(API_URL)
        .get('/search/flights')
        .query({
          source: 'Mumbai',
          destination: 'Delhi',
          date: '2025-07-10'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          // Check if we have at least one flight
          if (res.body.length > 0) {
            res.body[0].should.have.property('source');
            res.body[0].should.have.property('destination');
            res.body[0].should.have.property('departureTime');
          }
          done();
        });
    });

    it('should search for trains', (done) => {
      chai.request(API_URL)
        .get('/search/trains')
        .query({
          source: 'Mumbai',
          destination: 'Delhi',
          date: '2025-07-10'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          // Check if we have at least one train
          if (res.body.length > 0) {
            res.body[0].should.have.property('source');
            res.body[0].should.have.property('destination');
            res.body[0].should.have.property('departureTime');
          }
          done();
        });
    });

    it('should search for hotels', (done) => {
      chai.request(API_URL)
        .get('/search/hotels')
        .query({
          location: 'Mumbai',
          checkIn: '2025-07-10',
          checkOut: '2025-07-12'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          // Check if we have at least one hotel
          if (res.body.length > 0) {
            res.body[0].should.have.property('name');
            res.body[0].should.have.property('location');
            res.body[0].should.have.property('price');
          }
          done();
        });
    });
  });

  // Booking Tests (requires authentication)
  describe('Booking Functionality', () => {
    it('should create a flight booking', (done) => {
      // First get a flight to book
      chai.request(API_URL)
        .get('/search/flights')
        .query({
          source: 'Mumbai',
          destination: 'Delhi',
          date: '2025-07-10'
        })
        .end((err, res) => {
          if (res.body.length === 0) {
            // Skip test if no flights available
            done();
            return;
          }

          const flightId = res.body[0]._id;
          
          // Create booking
          chai.request(API_URL)
            .post('/bookings')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              type: 'flight',
              itemId: flightId,
              travelerInfo: {
                name: 'John Doe',
                age: 30,
                gender: 'Male',
                idType: 'Passport',
                idNumber: 'AB123456'
              },
              paymentInfo: {
                method: 'credit_card',
                amount: res.body[0].price
              }
            })
            .end((err, res) => {
              res.should.have.status(201);
              res.body.should.be.a('object');
              res.body.should.have.property('_id');
              res.body.should.have.property('status').eql('confirmed');
              res.body.should.have.property('type').eql('flight');
              
              // Save booking ID for later tests
              bookingId = res.body._id;
              done();
            });
        });
    });

    it('should get user bookings', (done) => {
      chai.request(API_URL)
        .get('/users/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          // If we have bookings, check their structure
          if (res.body.length > 0) {
            res.body[0].should.have.property('_id');
            res.body[0].should.have.property('status');
            res.body[0].should.have.property('type');
          }
          done();
        });
    });

    it('should get a specific booking by ID', (done) => {
      // Skip if no booking was created
      if (!bookingId) {
        done();
        return;
      }

      chai.request(API_URL)
        .get(`/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('_id').eql(bookingId);
          res.body.should.have.property('status');
          res.body.should.have.property('type');
          done();
        });
    });

    it('should cancel a booking', (done) => {
      // Skip if no booking was created
      if (!bookingId) {
        done();
        return;
      }

      chai.request(API_URL)
        .put(`/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'Change of plans'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('_id').eql(bookingId);
          res.body.should.have.property('status').eql('cancelled');
          done();
        });
    });
  });

  // User Profile Tests
  describe('User Profile', () => {
    it('should get user profile', (done) => {
      chai.request(API_URL)
        .get('/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('_id');
          res.body.should.have.property('email').eql(testUser.email);
          res.body.should.have.property('name');
          done();
        });
    });

    it('should update user profile', (done) => {
      const updatedInfo = {
        name: 'Updated Test User',
        phone: '5555555555'
      };

      chai.request(API_URL)
        .put('/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedInfo)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('_id');
          res.body.should.have.property('name').eql(updatedInfo.name);
          res.body.should.have.property('phone').eql(updatedInfo.phone);
          done();
        });
    });
  });

  // After all tests - clean up (optional)
  after((done) => {
    // Clean up could involve deleting test user, but we'll keep it for now
    done();
  });
});

