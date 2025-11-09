# Online Trip Booking System

This repository contains the source code, scripts and documentation for the Online Trip Booking System — a sample full-stack application that demonstrates booking flows for flights, trains and hotels with a Node.js + Express backend and a static frontend.

## Contents

- `backend/` - API server (Express, Mongoose models, routes, scripts)
- `frontend/` - Static frontend assets (HTML, CSS, JS, images)
- `docs/` - Design docs, diagrams, API references and guides
- `tests/` - Unit and integration tests

## Quick start

Prerequisites:
- Node.js (16+ recommended)
- npm
- MongoDB (running locally or via connection string)

Local development (backend):

1. Copy the example env and configure:

	- From `backend/.env.example` create a file `backend/.env` and set `MONGODB_URI`, `JWT_SECRET`, etc.

2. Install dependencies and start the server:

	- Open a terminal in `backend/` and run:

```powershell
npm install
npm run dev
```

The backend listens on `PORT` (default 3000). The entry point is `backend/server.js`.

Frontend:

- The frontend is static (see `frontend/`). Open `frontend/index.html` in a browser or serve it via a static server.

Running tests:

- Tests live in the `tests/` folder. From the repo root run:

```powershell
cd tests
npm install
npm test
```

## Useful scripts

Backend utility scripts located in `backend/scripts/`:

- `database_setup.js` - Initialize database schema and indexes
- `data_manager.js` - Unified data management CLI (setup, generate, clear, stats)
- `generate_comprehensive_data.js` - Generate flights, trains, hotels and bookings
- `generate_enhanced_comprehensive_data.js` - Enhanced data generation with more variety
- `create_sample_analytics_data.js` - Create sample bookings for analytics testing
- `delete_admin.js` - Delete admin accounts (use with caution)

Root-level backend scripts:

- `backend/check_admin.js` - Quick admin account check/creation
- `backend/reset_admin_password.js` - Reset admin password utility
- `backend/test-server.js` - Server startup test script

Documentation:

- `backend/DATA_MANAGEMENT_README.md` - Detailed notes about data generation and management
- `backend/RUN_INSTRUCTIONS.md` - Comprehensive setup and run instructions
- `docs/api/Online Booking System - Backend API.md` - Full API reference

## API Overview

The backend exposes a RESTful API at `http://localhost:3000/api`. All authenticated endpoints require a JWT token in the `Authorization: Bearer <token>` header.

### Main Endpoint Groups

**Authentication** (`/api/auth`)
- User registration and login
- Admin login (separate endpoint)
- Password management
- Get current user profile

**Search** (`/api/search`)
- Search flights, trains, hotels by criteria (date, location, price)
- Get details by ID for specific trips

**Bookings** (`/api/bookings`)
- Create bookings (flights/trains/hotels)
- Bulk bookings for multiple passengers
- Process payments
- View booking history
- Cancel bookings
- Download PDF tickets

**Users** (`/api/users`)
- View and update user profile
- Get user booking statistics

**Admin** (`/api/admin`)
- Manage users, bookings, flights, trains, hotels
- View analytics (revenue, booking trends, popular routes)
- Generate reports

### Example API Calls

**Register a new user:**

```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "9876543210"
}
```

**Login:**

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

# Returns: { "token": "eyJhbGc...", "user": {...} }
```

**Search flights:**

```bash
GET http://localhost:3000/api/search/flights?source=Delhi&destination=Mumbai&date=2025-12-01
```

**Create a flight booking:**

```bash
POST http://localhost:3000/api/bookings/flights
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "flightId": "673d4a1b2c...",
  "passengerDetails": {
    "name": "John Doe",
    "age": 30,
    "gender": "Male"
  }
}
```

**Admin login:**

```bash
POST http://localhost:3000/api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@travelease.com",
  "password": "TravelEase2025@SecureAdmin!"
}
```

**Get analytics overview (admin):**

```bash
GET http://localhost:3000/api/admin/analytics/overview
Authorization: Bearer <admin-token>
```

For complete API documentation with all endpoints, request/response schemas, and error codes, see:
- `docs/api/Online Booking System - Backend API.md`
- `docs/api/api-tests.http` (HTTP file for testing with REST Client extension)
- `docs/api/Online_Booking_System_API.postman_collection.json` (Postman collection)

## Architecture

This is a classic three-tier application:

1. **Frontend** - Static HTML/CSS/JS served from `frontend/` folder
2. **Backend API** - Node.js + Express REST API in `backend/`
3. **Database** - MongoDB with Mongoose ODM

**Models:** User, Admin, Flight, Train, Hotel, Booking

**Key Features:**
- JWT-based authentication with separate user/admin flows
- Role-based access control (admin permissions)
- Comprehensive input validation
- PDF ticket generation
- Analytics and reporting dashboard
- Bulk booking support

## Database Setup

The system uses MongoDB. To populate with sample data:

```powershell
cd backend
node scripts/data_manager.js --action=setup
node scripts/data_manager.js --action=generate --type=all --days=30
```

Or use the npm script:

```powershell
cd backend
npm run reset-db
npm run generate-data
```

To check database stats:

```powershell
cd backend
npm run db-stats
```

## Testing

Unit and integration tests are in the `tests/` folder. They use Mocha + Chai.

```powershell
cd tests
npm install
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:integration  # Integration tests only
```

Manual test cases and browser-based test pages are in `tests/manual/`.

## Development Notes

**Default Admin Credentials:**
- Email: `admin@travelease.com`
- Password: `TravelEase2025@SecureAdmin!`

To verify or create the admin account:

```powershell
cd backend
node check_admin.js
```

**Environment Variables:**

Copy `backend/.env.example` to `backend/.env` and configure:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for signing JWT tokens (change in production!)
- `JWT_EXPIRES_IN` - Token expiration (e.g., "7d", "24h")
- `PORT` - Server port (default 3000)
- `NODE_ENV` - Environment (development/production)

**Security Notes:**
- Never commit your `.env` file
- Change the default admin password in production
- Use a strong, random `JWT_SECRET` in production
- The `.gitignore` excludes sensitive files (`.env`, `node_modules/`)

## Project Structure

```
.
├── backend/
│   ├── models/          # Mongoose schemas (User, Admin, Flight, Train, Hotel, Booking)
│   ├── routes/          # Express routes (auth, search, bookings, users, admin)
│   ├── middleware/      # Auth middleware (JWT verification)
│   ├── utils/           # Utilities (eventBus, logger)
│   ├── scripts/         # Database and utility scripts
│   ├── server.js        # Main entry point
│   └── package.json     # Backend dependencies
├── frontend/
│   ├── pages/           # HTML pages (flights, trains, hotels, admin, etc.)
│   ├── css/             # Stylesheets
│   ├── js/              # Frontend JavaScript
│   ├── images/          # Assets
│   └── index.html       # Landing page
├── tests/
│   ├── unit_tests.js    # Unit tests
│   ├── integration_tests.js  # Integration tests
│   └── manual/          # Manual test cases and HTML test pages
├── docs/
│   ├── api/             # API documentation
│   ├── diagrams/        # ERD, class diagrams, sequence diagrams
│   ├── guides/          # Beginner's guide, architecture docs
│   ├── notes/           # Development notes and fixes
│   └── project_tracker/ # Project tracking and Gantt charts
└── README.md            # This file
```

## Troubleshooting

**"Cannot connect to MongoDB"**
- Ensure MongoDB is running: `mongod` or check your service
- Verify `MONGODB_URI` in your `.env` file

**"Admin login fails"**
- Run `node backend/check_admin.js` to verify/create the admin account
- Check the password matches the one in your `.env` or use the default

**"Port 3000 already in use"**
- Change `PORT` in `.env` or stop the process using port 3000

**Tests fail with connection errors**
- Ensure the backend server is running before integration tests
- Check MongoDB is accessible

## Contributing

This is an educational project demonstrating a booking system architecture. Feel free to:
- Add new features (e.g., payment gateway integration, email notifications)
- Improve the frontend with a modern framework (React, Vue, Angular)
- Add more comprehensive tests
- Enhance security (rate limiting, CSRF protection, etc.)

## License

Educational project - no license specified.