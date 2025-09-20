# Oral Exam Cheat Sheet – Online Booking System

Core stack
- Node.js: JS runtime for server-side code
- Express: Routing + middleware framework
- MongoDB: Document database; collections: users, admins, flights, trains, hotels, bookings
- Mongoose: ODM for schemas, validation, and queries
- JWT: Token-based authentication; sent as Authorization: Bearer <token>
- CORS: Controls which web origins can call the API

Architecture
- Entry: backend/server.js
- Routers: /api/auth, /api/search, /api/bookings, /api/users, /api/admin
- Middleware: backend/middleware/auth.js (authenticateUser, authenticateAdmin, rateLimitAuth, checkPermission)
- Models: in backend/models/*.js
- Utilities: backend/utils/eventBus.js, logger.js
- Real-time: /api/admin/stream via Server-Sent Events (SSE)

Common flows
- Registration/Login: Validate input -> save/find User -> bcrypt password check -> sign JWT -> client stores token
- Authenticated Request: Client sends Authorization header -> authenticateUser verifies token -> req.user available -> route executes
- Booking Creation: Validate -> find item -> create Booking -> decrement availability -> emit booking:created -> return JSON
- Cancellation: Verify owner -> set status cancelled -> restore availability -> set refunded if paid

Key security points
- Passwords hashed (bcrypt) in pre-save hooks
- JWT secret in .env (JWT_SECRET), expiry JWT_EXPIRES_IN
- Rate limiting for login (MAX_ATTEMPTS, LOCKOUT_TIME)
- CORS allows only allowedOrigins (strict in production)

Error handling
- JSON shape: { error: { message, status, details? } }
- 400 invalid input, 401 auth, 403 forbidden, 404 not found, 409 conflict, 500 server error

Database specifics
- Indexes on frequent queries: e.g., flights (source,destination,departureTime), bookings (userId,status,bookingDate)
- Booking embeds trip subdocs (flight/train/hotel details) to simplify ticket PDFs and history

SSE (real-time)
- EventBus emits 'user:registered' and 'booking:created'
- server.js broadcasts events to connected SSE clients at /api/admin/stream

Environment
- .env: MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN, PORT, NODE_ENV, DEBUG
- Connects to MongoDB with retry/backoff and event handlers (error/disconnected/reconnected)

How to extend
- Add a new model (e.g., Car), new routes (search, bookings), mount with app.use('/api/cars', routes)
- Reuse patterns: input validation, auth, Mongoose queries, consistent responses, optional SSE events

Performance & scaling
- Use indexes, paginate results, connection pool (configured), add caching layer, horizontal scaling + load balancer
- Consider rate limits and circuit breakers for robustness

Checklist before demo
- MongoDB running; .env configured
- Seed sample data via backend/data_manager.js --action=setup
- Start server: node backend/server.js; test /api/health
- Use Postman collection (docs/postman/Online_Booking_System.postman_collection.json)
