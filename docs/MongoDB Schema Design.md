## MongoDB Schema Design

Based on our ER diagram and the chosen technology stack, here's the detailed MongoDB schema design for the Online Booking System.

### 1. Users Collection

```javascript
{
  "_id": ObjectId("..."),
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "passwordHash": "$2b$10$...", // Hashed password using bcrypt
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z")
}
```

### 2. Flights Collection

```javascript
{
  "_id": ObjectId("..."),
  "flightNumber": "AI101",
  "airline": "Air India",
  "source": "Delhi",
  "destination": "Mumbai",
  "departureTime": ISODate("2024-02-15T06:30:00Z"),
  "arrivalTime": ISODate("2024-02-15T08:45:00Z"),
  "price": 5500,
  "availableSeats": 150,
  "totalSeats": 180,
  "aircraft": "Boeing 737",
  "status": "active", // active, cancelled, delayed
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z")
}
```

### 3. Trains Collection

```javascript
{
  "_id": ObjectId("..."),
  "trainNumber": "12345",
  "trainName": "Rajdhani Express",
  "source": "Delhi",
  "destination": "Mumbai",
  "departureTime": ISODate("2024-02-15T16:30:00Z"),
  "arrivalTime": ISODate("2024-02-16T08:30:00Z"),
  "price": 2500,
  "availableSeats": 200,
  "totalSeats": 300,
  "class": "AC 2-Tier",
  "status": "active", // active, cancelled, delayed
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z")
}
```

### 4. Hotels Collection

```javascript
{
  "_id": ObjectId("..."),
  "name": "Grand Hotel Mumbai",
  "location": "Mumbai",
  "address": "123 Marine Drive, Mumbai, Maharashtra",
  "price": 3500, // per night
  "rating": 4.5,
  "amenities": ["WiFi", "Pool", "Gym", "Restaurant", "Room Service"],
  "availableRooms": 25,
  "totalRooms": 50,
  "roomType": "Deluxe",
  "images": ["hotel1.jpg", "hotel2.jpg"],
  "status": "active", // active, inactive
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z")
}
```

### 5. Bookings Collection

```javascript
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."), // Reference to Users collection
  "bookingType": "flight", // flight, train, hotel, multi
  "bookingDate": ISODate("2024-01-20T14:30:00Z"),
  "status": "confirmed", // pending, confirmed, cancelled, failed
  "totalAmount": 5500,
  "paymentStatus": "completed", // pending, completed, failed, refunded
  "paymentId": "pay_123456789",
  
  // Trip details embedded
  "trip": {
    "type": "flight",
    "destination": "Mumbai",
    "startDate": ISODate("2024-02-15T06:30:00Z"),
    "endDate": ISODate("2024-02-15T08:45:00Z"),
    
    // Flight-specific details (when bookingType is flight)
    "flightDetails": {
      "flightId": ObjectId("..."),
      "flightNumber": "AI101",
      "airline": "Air India",
      "source": "Delhi",
      "destination": "Mumbai",
      "departureTime": ISODate("2024-02-15T06:30:00Z"),
      "arrivalTime": ISODate("2024-02-15T08:45:00Z"),
      "seatNumber": "12A",
      "passengerDetails": {
        "name": "John Doe",
        "age": 30,
        "gender": "Male",
        "idType": "Passport",
        "idNumber": "A1234567"
      }
    }
    
    // Train-specific details (when bookingType is train)
    // "trainDetails": {
    //   "trainId": ObjectId("..."),
    //   "trainNumber": "12345",
    //   "trainName": "Rajdhani Express",
    //   "source": "Delhi",
    //   "destination": "Mumbai",
    //   "departureTime": ISODate("2024-02-15T16:30:00Z"),
    //   "arrivalTime": ISODate("2024-02-16T08:30:00Z"),
    //   "seatNumber": "A1-25",
    //   "class": "AC 2-Tier",
    //   "passengerDetails": {
    //     "name": "John Doe",
    //     "age": 30,
    //     "gender": "Male",
    //     "idType": "Aadhar",
    //     "idNumber": "1234-5678-9012"
    //   }
    // }
    
    // Hotel-specific details (when bookingType is hotel)
    // "hotelDetails": {
    //   "hotelId": ObjectId("..."),
    //   "name": "Grand Hotel Mumbai",
    //   "location": "Mumbai",
    //   "checkInDate": ISODate("2024-02-15T14:00:00Z"),
    //   "checkOutDate": ISODate("2024-02-17T11:00:00Z"),
    //   "nights": 2,
    //   "roomNumber": "205",
    //   "roomType": "Deluxe",
    //   "guestDetails": {
    //     "primaryGuest": "John Doe",
    //     "numberOfGuests": 2,
    //     "specialRequests": "Late check-in"
    //   }
    // }
  },
  
  "createdAt": ISODate("2024-01-20T14:30:00Z"),
  "updatedAt": ISODate("2024-01-20T14:30:00Z")
}
```

### 6. Admins Collection (Optional - for admin functionality)

```javascript
{
  "_id": ObjectId("..."),
  "username": "admin",
  "email": "admin@bookingsystem.com",
  "passwordHash": "$2b$10$...", // Hashed password
  "role": "admin",
  "permissions": ["manage_users", "manage_flights", "manage_trains", "manage_hotels", "view_reports"],
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z")
}
```

### Schema Design Considerations

1. **Embedding vs Referencing:**
   - **Bookings** embed trip details to avoid multiple queries when displaying booking information
   - **Users**, **Flights**, **Trains**, and **Hotels** are separate collections for independent management
   - **Passenger/Guest details** are embedded within bookings as they're specific to each booking

2. **Indexing Strategy:**
   - Create indexes on frequently queried fields:
     - `users.email` (unique)
     - `flights.source`, `flights.destination`, `flights.departureTime`
     - `trains.source`, `trains.destination`, `trains.departureTime`
     - `hotels.location`
     - `bookings.userId`, `bookings.status`

3. **Data Validation:**
   - Use Mongoose schema validation for data integrity
   - Implement custom validators for business rules (e.g., departure time must be in the future)

4. **Security:**
   - Never store plain text passwords
   - Use bcrypt for password hashing
   - Implement proper authentication and authorization

This schema design provides flexibility for different booking types while maintaining data consistency and query efficiency.

