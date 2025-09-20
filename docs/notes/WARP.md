# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.
``

## Overview

This repository contains a Node.js/Express backend for an Online Booking System with MongoDB (via Mongoose). It exposes REST APIs for authentication, search (flights/trains/hotels), bookings, users, and admin operations. A data management layer seeds and manages sample data to support local development.

Key locations:
- Backend source and scripts: backend/
- API server entrypoint: backend/server.js
- Models: backend/models/
- Middleware: backend/middleware/
- Postman collection: Online_Booking_System_API.postman_collection.json
- HTTP request samples: api-tests.http

If a separate frontend exists, it is expected outside this folder; some docs reference D:\Online_Trip_Booking_System\frontend. Focus here is the backend.

## Environment and prerequisites

- Node.js (LTS recommended)
- MongoDB running locally (default connection string is mongodb://localhost:27017/online_booking_system)
- Required env vars (backend/.env):
  - MONGODB_URI
  - JWT_SECRET
  - JWT_EXPIRES_IN
  - PORT (defaults to 3000)
  - NODE_ENV (development|production)

Windows PowerShell equivalents are provided where applicable.

## Common commands

Run all commands from backend/ unless noted.

- Install dependencies
  - PowerShell: npm install

- Initialize environment
  - PowerShell: Copy-Item env.example .env
  - Edit as needed (do not print secrets): notepad .env

- Start MongoDB (Windows service)
  - PowerShell (Admin): net start MongoDB
  - If service is unavailable: mongod --dbpath "C:\\data\\db"

- Start the API server
  - Production-like: npm start
  - Development (auto-restart): npm run dev
  - Debugging: npm run debug (or npm run debug-brk)

- Health check (from a separate terminal)
  - PowerShell: iwr http://localhost:3000/api/health | Select-Object -ExpandProperty Content
  - Quick startup verification: npm run health (starts server, detects successful boot from logs, then exits). Note: if port 3000 is in use, the server will choose the next available port; check the console message for the actual port.

- Data management (seed/reset/stats)
  - One-time setup with sample data: npm run setup-db
  - Reset and full re-seed: npm run reset-db
  - Generate broader sample data: npm run generate-data
  - Show DB stats: npm run db-stats
  - Direct usage examples:
    - node data_manager.js --action=setup
    - node data_manager.js --action=generate --type=all --days=30
    - node data_manager.js --action=stats

- Tests
  - npm test (delegates to ../tests)
  - npm run test:unit
  - npm run test:integration
  - Notes:
    - Tests are expected in a sibling tests project (../tests). If that folder is absent, these scripts will fail.
    - To run a single test, use the framework-specific selector from the tests project (e.g., for Jest: npm test -- <pattern>), executed inside ../tests.

- Lint
  - Linting is not configured yet (scripts.lint is a placeholder).

## High-level architecture

- Web server and platform
  - Express app bootstrapped in backend/server.js
  - CORS configured via an allowedOrigins list that depends on NODE_ENV
  - JSON and URL-encoded body parsing enabled
  - Request logging middleware emits ISO timestamp and method/path
  - Health endpoint at GET /api/health
  - Root endpoint at GET /
  - 404 handler and centralized error handler return normalized error JSON
  - Dynamic port selection: attempts PORT or next available

- Database layer
  - MongoDB via Mongoose with retry-based connectToMongoDB()
  - Connection event handlers for error/disconnect/reconnect with logging
  - Models (Mongoose schemas): User, Booking, Flight, Train, Hotel, Admin
    - Example: User hashes password on save and omits passwordHash from JSON
    - Example: Booking embeds typed trip details (flight/train/hotel) with indexes on userId, status, bookingDate, and trip.type

- Authentication and authorization
  - JWT-based auth (middleware/auth.js)
    - authenticateUser and authenticateAdmin read Bearer tokens, verify with JWT_SECRET, and load User/Admin from DB
    - checkPermission(permission) middleware for admin route-level authorization with roles/permissions

- Routes (modularized)
  - Mounted in server.js:
    - /api/auth -> authentication flows (user register/login, admin login, etc.)
    - /api/search -> flight/train/hotel search and lookups
    - /api/bookings -> create/cancel/payment/history
    - /api/users -> profile, stats
    - /api/admin -> user/booking/service management and analytics
  - See backend/Online Booking System - Backend API.md for a consolidated endpoint list

- Event streaming (SSE) for admin
  - Endpoint: GET /api/admin/stream
  - Maintains sseClients set and an eventHistory buffer
  - Integrates with utils/eventBus to broadcast domain events (e.g., user:registered, booking:created)
  - Sends server-sent events with event names and JSON payloads for admin dashboards

- Data management utilities
  - data_manager.js orchestrates setup, generation, stats, and clear flows
  - Scripts: setup-db, reset-db, generate-data, db-stats map to data_manager.js actions
  - Additional helper scripts under backend/ support generating comprehensive sample data and bookings

## Useful project collateral

- Online_Booking_System_API.postman_collection.json: Import into Postman for ready-made request collections
- api-tests.http: Use with an HTTP client that supports .http files (or convert requests to curl/Invoke-WebRequest)
- backend/CMD_QUICK_REFERENCE.md and backend/RUN_INSTRUCTIONS.md: Windows-focused quick start and troubleshooting

## Windows and shell notes

- PowerShell differences:
  - Copy-Item env.example .env (instead of cp or copy in some shells)
  - iwr is an alias for Invoke-WebRequest (useful for quick health checks)
- MongoDB service control requires an elevated terminal (Run as Administrator).
