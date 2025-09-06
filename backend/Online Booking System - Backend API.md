# Online Booking System - Backend API

This is the backend API for the Online Booking System, built with Node.js, Express, and MongoDB.

## Features

- User authentication (register, login)
- Admin authentication and management
- Search for flights, trains, and hotels
- Create and manage bookings
- Process payments
- View booking history
- Cancel bookings
- Admin dashboard with reports

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### Search
- `GET /api/search/flights` - Search flights
- `GET /api/search/trains` - Search trains
- `GET /api/search/hotels` - Search hotels
- `GET /api/search/flights/:id` - Get flight by ID
- `GET /api/search/trains/:id` - Get train by ID
- `GET /api/search/hotels/:id` - Get hotel by ID

### Bookings
- `POST /api/bookings/flights` - Create flight booking
- `POST /api/bookings/trains` - Create train booking
- `POST /api/bookings/hotels` - Create hotel booking
- `POST /api/bookings/:id/payment` - Process payment for booking
- `GET /api/bookings/history` - Get user's bookings
- `GET /api/bookings/:id` - Get booking by ID
- `DELETE /api/bookings/:id` - Cancel booking

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get user's booking statistics

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID
- `GET /api/admin/users/:id/bookings` - Get user's bookings
- `POST /api/admin/flights` - Create flight
- `PUT /api/admin/flights/:id` - Update flight
- `DELETE /api/admin/flights/:id` - Delete flight
- `POST /api/admin/trains` - Create train
- `PUT /api/admin/trains/:id` - Update train
- `DELETE /api/admin/trains/:id` - Delete train
- `POST /api/admin/hotels` - Create hotel
- `PUT /api/admin/hotels/:id` - Update hotel
- `DELETE /api/admin/hotels/:id` - Delete hotel
- `GET /api/admin/reports/bookings` - Get booking statistics

## Setup and Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/online_booking_system
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   JWT_EXPIRES_IN=24h
   NODE_ENV=development
   ```

3. Set up the database with sample data:
   ```
   npm run setup-db
   ```

4. Start the server:
   ```
   npm start
   ```

5. For development with auto-restart:
   ```
   npm run dev
   ```

## API Documentation

The API is RESTful and returns JSON responses. All endpoints that require authentication expect a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Error responses follow this format:
```json
{
  "error": {
    "message": "Error message",
    "status": 400
  }
}
```

Success responses typically include a message and the requested data:
```json
{
  "message": "Success message",
  "data": {}
}
```

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT for authentication
- bcrypt for password hashing

