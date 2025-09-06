# Online Booking System

**A Comprehensive System for Booking Trains, Planes, and Hotels**

---

## Table of Contents

1. [Introduction](#introduction)
2. [Project Overview](#project-overview)
3. [System Design](#system-design)
   - [Use Case Diagram](#use-case-diagram)
   - [ER Diagram](#er-diagram)
   - [Class Diagram](#class-diagram)
   - [Sequence Diagrams](#sequence-diagrams)
   - [System Architecture](#system-architecture)
4. [Database Design](#database-design)
   - [MongoDB Schema](#mongodb-schema)
   - [Sample Data](#sample-data)
5. [Backend Development](#backend-development)
   - [Technology Stack](#backend-technology-stack)
   - [Project Structure](#backend-project-structure)
   - [API Endpoints](#api-endpoints)
   - [Authentication](#authentication)
6. [Frontend Development](#frontend-development)
   - [Technology Stack](#frontend-technology-stack)
   - [Project Structure](#frontend-project-structure)
   - [User Interface](#user-interface)
   - [Responsive Design](#responsive-design)
7. [Testing](#testing)
   - [Unit Testing](#unit-testing)
   - [Integration Testing](#integration-testing)
   - [User Acceptance Testing](#user-acceptance-testing)
8. [Deployment](#deployment)
   - [Prerequisites](#prerequisites)
   - [Backend Deployment](#backend-deployment)
   - [Frontend Deployment](#frontend-deployment)
   - [Database Setup](#database-setup)
9. [User Guide](#user-guide)
   - [Getting Started](#getting-started)
   - [Searching for Travel Options](#searching-for-travel-options)
   - [Making a Booking](#making-a-booking)
   - [Managing Bookings](#managing-bookings)
10. [Administrator Guide](#administrator-guide)
    - [Managing Users](#managing-users)
    - [Managing Inventory](#managing-inventory)
    - [Managing Bookings](#managing-bookings)
11. [Conclusion](#conclusion)
12. [References](#references)

---

## Introduction

The Online Booking System is a comprehensive web application designed to provide users with a seamless experience for booking trains, planes, and hotels. This project was developed as part of a college assignment to demonstrate the application of software engineering principles in building a real-world application.

The system allows users to search for available travel options, make bookings, and manage their reservations. It also provides an administrative interface for managing users, inventory, and bookings.

This document serves as a comprehensive guide to the Online Booking System, covering all aspects from design and development to deployment and usage.

## Project Overview

### Project Objectives

The main objectives of the Online Booking System project are:

1. Develop a user-friendly online booking system for flights, trains, and hotels
2. Implement a secure authentication system for users and administrators
3. Create a responsive and intuitive user interface for all devices
4. Design a robust backend API for handling booking operations
5. Implement a database schema for storing user and booking information
6. Ensure the system is secure, reliable, and scalable

### Project Scope

The scope of the Online Booking System includes:

1. User registration and authentication
2. Search functionality for flights, trains, and hotels
3. Booking and payment processing
4. Booking management (view, cancel)
5. User profile management
6. Admin panel for managing users, flights, trains, and hotels

### Technology Stack

The Online Booking System is built using the following technologies:

1. **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
2. **Backend**: Node.js with Express.js
3. **Database**: MongoDB
4. **Authentication**: JSON Web Tokens (JWT)
5. **Version Control**: Git

### Project Timeline

The project was developed over a period of six weeks, with the following timeline:

1. **Week 1**: Project Planning and Requirements Gathering
2. **Week 2**: System Design and Architecture
3. **Week 3**: Database Setup and Backend Development
4. **Week 4**: Frontend Development
5. **Week 5**: Integration and Testing
6. **Week 6**: Documentation and Deployment

## System Design

### Use Case Diagram

The Use Case Diagram illustrates the interactions between users and the system. It shows the main functionalities of the Online Booking System and how different actors interact with these functionalities.

![Use Case Diagram](/home/ubuntu/online_booking_system/docs/refined_use_case_diagram.png)

#### Actors

1. **User**: Regular users who can search for travel options, make bookings, and manage their profile and bookings.
2. **Admin**: Administrators who can manage users, inventory, and bookings.

#### Use Cases

1. **User Registration**: Users can create a new account.
2. **User Login**: Users can log in to their account.
3. **Search for Flights**: Users can search for available flights.
4. **Search for Trains**: Users can search for available trains.
5. **Search for Hotels**: Users can search for available hotels.
6. **Make Booking**: Users can book flights, trains, or hotels.
7. **Make Payment**: Users can pay for their bookings.
8. **View Booking History**: Users can view their past and upcoming bookings.
9. **Cancel Booking**: Users can cancel their bookings.
10. **Manage Profile**: Users can update their profile information.
11. **Manage Users**: Admins can manage user accounts.
12. **Manage Inventory**: Admins can manage flights, trains, and hotels.
13. **Manage Bookings**: Admins can manage bookings.

### ER Diagram

The Entity-Relationship (ER) Diagram shows the structure of the database and the relationships between different entities in the Online Booking System.

![ER Diagram](/home/ubuntu/online_booking_system/docs/erdiagram.png)

#### Entities

1. **User**: Represents a user of the system.
2. **Flight**: Represents a flight.
3. **Train**: Represents a train.
4. **Hotel**: Represents a hotel.
5. **Booking**: Represents a booking made by a user.
6. **Admin**: Represents an administrator of the system.

#### Relationships

1. **User-Booking**: A user can have multiple bookings, but each booking belongs to only one user.
2. **Flight-Booking**: A flight can have multiple bookings, and a booking can be for a flight.
3. **Train-Booking**: A train can have multiple bookings, and a booking can be for a train.
4. **Hotel-Booking**: A hotel can have multiple bookings, and a booking can be for a hotel.

### Class Diagram

The Class Diagram shows the structure of the system in terms of classes, their attributes, methods, and relationships.

![Class Diagram](/home/ubuntu/online_booking_system/docs/refined_class_diagram.png)

#### Classes

1. **User**: Represents a user of the system.
2. **Flight**: Represents a flight.
3. **Train**: Represents a train.
4. **Hotel**: Represents a hotel.
5. **Booking**: Represents a booking made by a user.
6. **Admin**: Represents an administrator of the system.
7. **Payment**: Represents a payment made for a booking.
8. **Authentication**: Handles user authentication.
9. **Search**: Handles search functionality.
10. **BookingManager**: Manages booking operations.

#### Relationships

1. **User-Booking**: A user can have multiple bookings, but each booking belongs to only one user.
2. **Flight-Booking**: A flight can have multiple bookings, and a booking can be for a flight.
3. **Train-Booking**: A train can have multiple bookings, and a booking can be for a train.
4. **Hotel-Booking**: A hotel can have multiple bookings, and a booking can be for a hotel.
5. **Booking-Payment**: A booking has one payment, and a payment belongs to one booking.

### Sequence Diagrams

Sequence Diagrams illustrate the interactions between objects in a sequential order, showing how processes are carried out over time.

#### User Registration/Login

![User Registration/Login Sequence Diagram](/home/ubuntu/online_booking_system/docs/sequence_diagram_user_auth.png)

This diagram shows the process of user registration and login, including:
1. User submits registration/login form
2. Frontend validates input
3. Backend processes request
4. Database stores/retrieves user data
5. JWT token is generated and returned
6. User is authenticated

#### Searching for Trips

![Searching for Trips Sequence Diagram](/home/ubuntu/online_booking_system/docs/sequence_diagram_search_trips.png)

This diagram shows the process of searching for flights, trains, or hotels, including:
1. User submits search form
2. Frontend validates input
3. Backend processes search request
4. Database retrieves matching results
5. Results are displayed to the user

#### Making a Booking

![Making a Booking Sequence Diagram](/home/ubuntu/online_booking_system/docs/sequence_diagram_make_booking.png)

This diagram shows the process of making a booking, including:
1. User selects a flight, train, or hotel
2. User enters traveler information
3. Backend validates booking request
4. Database creates booking record
5. Confirmation is displayed to the user

#### Making a Payment

![Making a Payment Sequence Diagram](/home/ubuntu/online_booking_system/docs/sequence_diagram_make_payment.png)

This diagram shows the process of making a payment for a booking, including:
1. User enters payment information
2. Frontend validates input
3. Backend processes payment
4. Database updates booking status
5. Confirmation is displayed to the user

#### Viewing Booking History

![Viewing Booking History Sequence Diagram](/home/ubuntu/online_booking_system/docs/sequence_diagram_view_booking_history.png)

This diagram shows the process of viewing booking history, including:
1. User requests booking history
2. Backend retrieves bookings for the user
3. Database returns booking records
4. Booking history is displayed to the user

#### Cancelling a Booking

![Cancelling a Booking Sequence Diagram](/home/ubuntu/online_booking_system/docs/sequence_diagram_cancel_booking.png)

This diagram shows the process of cancelling a booking, including:
1. User selects a booking to cancel
2. User confirms cancellation
3. Backend processes cancellation request
4. Database updates booking status
5. Confirmation is displayed to the user

### System Architecture

The Online Booking System follows a client-server architecture with a RESTful API. The system is divided into three main components:

1. **Frontend**: HTML, CSS, JavaScript, and Bootstrap
2. **Backend**: Node.js with Express.js
3. **Database**: MongoDB

#### Architecture Diagram

![System Architecture Diagram](/home/ubuntu/online_booking_system/docs/system_architecture.png)

#### Component Interaction

The components interact with each other as follows:

1. The frontend sends HTTP requests to the backend API
2. The backend API processes the requests, interacts with the database, and returns responses
3. The database stores and retrieves data as requested by the backend

#### Security Architecture

The system implements several security measures:

1. **Authentication**: JWT-based authentication for users and administrators
2. **Authorization**: Role-based access control for different user types
3. **Data Protection**: Password hashing using bcrypt
4. **Input Validation**: Server-side validation of all inputs
5. **HTTPS**: Secure communication between client and server

## Database Design

### MongoDB Schema

The Online Booking System uses MongoDB, a NoSQL document database, to store and manage data. The database schema consists of the following collections:

#### Users Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String, // Hashed
  phone: String,
  address: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Flights Collection

```javascript
{
  _id: ObjectId,
  flightNumber: String,
  airline: String,
  source: String,
  destination: String,
  departureTime: Date,
  arrivalTime: Date,
  duration: Number, // in minutes
  price: Number,
  availableSeats: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Trains Collection

```javascript
{
  _id: ObjectId,
  trainNumber: String,
  trainName: String,
  source: String,
  destination: String,
  departureTime: Date,
  arrivalTime: Date,
  duration: Number, // in minutes
  price: Number,
  availableSeats: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Hotels Collection

```javascript
{
  _id: ObjectId,
  name: String,
  location: String,
  address: String,
  rating: Number,
  pricePerNight: Number,
  amenities: [String],
  availableRooms: Number,
  images: [String],
  createdAt: Date,
  updatedAt: Date
}
```

#### Bookings Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users collection
  type: String, // "flight", "train", or "hotel"
  itemId: ObjectId, // Reference to Flights, Trains, or Hotels collection
  status: String, // "pending", "confirmed", "cancelled"
  bookingDate: Date,
  travelDate: Date,
  returnDate: Date, // Optional, for round trips
  travelerInfo: [
    {
      name: String,
      age: Number,
      gender: String,
      idType: String,
      idNumber: String
    }
  ],
  paymentInfo: {
    method: String,
    amount: Number,
    status: String,
    transactionId: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Admins Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String, // Hashed
  role: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Sample Data

The database is populated with sample data for testing and demonstration purposes. Here are some examples:

#### Users Sample Data

```javascript
[
  {
    _id: ObjectId("60d5ec9af682fbd12a8924a1"),
    name: "John Doe",
    email: "john@example.com",
    password: "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LG1.7TL/Lqn5zRGYuKpVN9X5zAKAUey", // "password123"
    phone: "+91 9876543210",
    address: "123 Main St, Mumbai",
    createdAt: ISODate("2023-06-21T10:30:00Z"),
    updatedAt: ISODate("2023-06-21T10:30:00Z")
  },
  {
    _id: ObjectId("60d5ec9af682fbd12a8924a2"),
    name: "Jane Smith",
    email: "jane@example.com",
    password: "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LG1.7TL/Lqn5zRGYuKpVN9X5zAKAUey", // "password123"
    phone: "+91 9876543211",
    address: "456 Park Ave, Delhi",
    createdAt: ISODate("2023-06-21T11:45:00Z"),
    updatedAt: ISODate("2023-06-21T11:45:00Z")
  }
]
```

#### Flights Sample Data

```javascript
[
  {
    _id: ObjectId("60d5ec9af682fbd12a8924b1"),
    flightNumber: "AI101",
    airline: "Air India",
    source: "Mumbai",
    destination: "Delhi",
    departureTime: ISODate("2023-07-10T08:00:00Z"),
    arrivalTime: ISODate("2023-07-10T10:00:00Z"),
    duration: 120, // 2 hours
    price: 5500,
    availableSeats: 150,
    createdAt: ISODate("2023-06-21T10:30:00Z"),
    updatedAt: ISODate("2023-06-21T10:30:00Z")
  },
  {
    _id: ObjectId("60d5ec9af682fbd12a8924b2"),
    flightNumber: "6E202",
    airline: "IndiGo",
    source: "Delhi",
    destination: "Bangalore",
    departureTime: ISODate("2023-07-12T14:00:00Z"),
    arrivalTime: ISODate("2023-07-12T16:30:00Z"),
    duration: 150, // 2.5 hours
    price: 4800,
    availableSeats: 180,
    createdAt: ISODate("2023-06-21T10:35:00Z"),
    updatedAt: ISODate("2023-06-21T10:35:00Z")
  }
]
```

## Backend Development

### Backend Technology Stack

The backend of the Online Booking System is built using the following technologies:

1. **Node.js**: A JavaScript runtime for building server-side applications
2. **Express.js**: A web application framework for Node.js
3. **MongoDB**: A NoSQL document database
4. **Mongoose**: An Object Data Modeling (ODM) library for MongoDB and Node.js
5. **JSON Web Tokens (JWT)**: For authentication and authorization
6. **bcryptjs**: For password hashing
7. **dotenv**: For environment variable management

### Backend Project Structure

The backend project is structured as follows:

```
backend/
├── node_modules/
├── models/
│   ├── User.js
│   ├── Flight.js
│   ├── Train.js
│   ├── Hotel.js
│   ├── Booking.js
│   └── Admin.js
├── routes/
│   ├── auth.js
│   ├── search.js
│   ├── bookings.js
│   ├── users.js
│   └── admin.js
├── middleware/
│   └── auth.js
├── server.js
├── package.json
└── .env
```

### API Endpoints

The backend provides the following API endpoints:

#### Authentication Endpoints

- **POST /api/auth/register**: Register a new user
- **POST /api/auth/login**: Login a user
- **POST /api/auth/admin/login**: Login an admin
- **GET /api/auth/me**: Get current user profile
- **GET /api/auth/logout**: Logout a user

#### Search Endpoints

- **GET /api/search/flights**: Search for flights
- **GET /api/search/trains**: Search for trains
- **GET /api/search/hotels**: Search for hotels

#### Booking Endpoints

- **POST /api/bookings**: Create a new booking
- **GET /api/bookings**: Get all bookings for the current user
- **GET /api/bookings/:id**: Get a specific booking
- **PUT /api/bookings/:id/cancel**: Cancel a booking
- **POST /api/bookings/:id/payment**: Process payment for a booking

#### User Endpoints

- **GET /api/users/profile**: Get user profile
- **PUT /api/users/profile**: Update user profile
- **GET /api/users/bookings**: Get all bookings for the current user

#### Admin Endpoints

- **GET /api/admin/users**: Get all users
- **GET /api/admin/users/:id**: Get a specific user
- **PUT /api/admin/users/:id**: Update a user
- **DELETE /api/admin/users/:id**: Delete a user
- **GET /api/admin/bookings**: Get all bookings
- **GET /api/admin/bookings/:id**: Get a specific booking
- **PUT /api/admin/bookings/:id**: Update a booking
- **DELETE /api/admin/bookings/:id**: Delete a booking
- **GET /api/admin/flights**: Get all flights
- **POST /api/admin/flights**: Create a new flight
- **PUT /api/admin/flights/:id**: Update a flight
- **DELETE /api/admin/flights/:id**: Delete a flight
- **GET /api/admin/trains**: Get all trains
- **POST /api/admin/trains**: Create a new train
- **PUT /api/admin/trains/:id**: Update a train
- **DELETE /api/admin/trains/:id**: Delete a train
- **GET /api/admin/hotels**: Get all hotels
- **POST /api/admin/hotels**: Create a new hotel
- **PUT /api/admin/hotels/:id**: Update a hotel
- **DELETE /api/admin/hotels/:id**: Delete a hotel

### Authentication

The backend implements JWT-based authentication for users and administrators. The authentication flow is as follows:

1. User submits login credentials (email and password)
2. Backend verifies credentials against the database
3. If credentials are valid, backend generates a JWT token
4. Token is returned to the client and stored in localStorage
5. Client includes token in Authorization header for subsequent requests
6. Backend verifies token for protected routes

## Frontend Development

### Frontend Technology Stack

The frontend of the Online Booking System is built using the following technologies:

1. **HTML5**: For structure
2. **CSS3**: For styling
3. **JavaScript**: For interactivity
4. **Bootstrap 5**: For responsive design and UI components

### Frontend Project Structure

The frontend project is structured as follows:

```
frontend/
├── css/
│   └── styles.css
├── js/
│   └── main.js
├── images/
│   └── ...
├── pages/
│   ├── flights.html
│   ├── trains.html
│   ├── hotels.html
│   ├── booking.html
│   ├── bookings.html
│   ├── about.html
│   └── contact.html
└── index.html
```

### User Interface

The frontend provides a user-friendly interface for the Online Booking System. The main pages are:

#### Home Page

The home page provides quick access to search for flights, trains, and hotels. It also displays featured destinations and special offers.

#### Flights Page

The flights page allows users to search for flights by entering source, destination, and date. It displays search results with flight details and allows users to book flights.

#### Trains Page

The trains page allows users to search for trains by entering source, destination, and date. It displays search results with train details and allows users to book trains.

#### Hotels Page

The hotels page allows users to search for hotels by entering location, check-in/out dates, and number of guests. It displays search results with hotel details and allows users to book hotels.

#### Booking Page

The booking page allows users to enter traveler information and payment details to complete a booking.

#### Bookings Page

The bookings page displays a user's booking history, including past, current, and cancelled bookings. It allows users to view booking details and cancel bookings.

### Responsive Design

The frontend is fully responsive and works well on all device sizes:

1. **Desktop**: Optimized for large screens (1200px and above)
2. **Tablet**: Adapted for medium screens (768px to 1199px)
3. **Mobile**: Optimized for small screens (below 768px)

## Testing

### Unit Testing

Unit tests focus on testing individual components in isolation. For the Online Booking System, unit tests were created for:

1. **Backend API Endpoints**: Testing each API endpoint for correct responses
2. **Database Models**: Testing model validation and methods
3. **Authentication**: Testing user authentication and authorization
4. **Form Validation**: Testing input validation for all forms

Unit tests were implemented using **Mocha** and **Chai** for the backend, and **Jest** for the frontend.

### Integration Testing

Integration tests focus on testing the interaction between components. For the Online Booking System, integration tests were created for:

1. **API-Database Integration**: Testing API endpoints with the database
2. **Frontend-Backend Integration**: Testing frontend components with the backend API
3. **Authentication Flow**: Testing the complete authentication process
4. **Booking Flow**: Testing the complete booking process

Integration tests were implemented using **Supertest** for API testing and **Cypress** for end-to-end testing.

### User Acceptance Testing

User acceptance tests focus on testing the system from a user's perspective. For the Online Booking System, user acceptance tests were created for:

1. **User Registration and Login**: Testing the user registration and login process
2. **Search Functionality**: Testing the search functionality for flights, trains, and hotels
3. **Booking Process**: Testing the complete booking process
4. **Payment Process**: Testing the payment process
5. **User Profile Management**: Testing user profile management
6. **Booking Management**: Testing booking management (view, cancel)

User acceptance tests were conducted manually using a test script and checklist.

## Deployment

### Prerequisites

To deploy the Online Booking System, you need:

1. Node.js (v14 or higher)
2. MongoDB (v4 or higher)
3. npm or yarn
4. A web server (e.g., Nginx or Apache)

### Backend Deployment

To deploy the backend:

1. Clone the repository: `git clone https://github.com/username/online-booking-system.git`
2. Navigate to the backend directory: `cd online-booking-system/backend`
3. Install dependencies: `npm install`
4. Create a `.env` file with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/online_booking_system
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=24h
   NODE_ENV=production
   ```
5. Start the server: `npm start`

### Frontend Deployment

To deploy the frontend:

1. Navigate to the frontend directory: `cd ../frontend`
2. Configure the API endpoint in `js/main.js` to point to your backend server
3. Deploy the frontend files to your web server

### Database Setup

To set up the database:

1. Start MongoDB: `mongod`
2. Run the database setup script: `node database_setup.js`

## User Guide

### Getting Started

1. **Registration**: Create a new account by clicking on the "Register" button and filling in the required information.
2. **Login**: Log in to your account using your email and password.
3. **Home Page**: The home page provides quick access to search for flights, trains, and hotels.

### Searching for Travel Options

1. **Flights**: Navigate to the Flights page, enter source, destination, and date, and click on "Search".
2. **Trains**: Navigate to the Trains page, enter source, destination, and date, and click on "Search".
3. **Hotels**: Navigate to the Hotels page, enter location, check-in/out dates, and guests, and click on "Search".

### Making a Booking

1. **Select Option**: From the search results, select the flight, train, or hotel you want to book.
2. **Enter Details**: Fill in the traveler information and any additional details required.
3. **Payment**: Enter payment information and complete the booking.
4. **Confirmation**: Receive a booking confirmation with details of your booking.

### Managing Bookings

1. **View Bookings**: Navigate to the Profile page and click on "Booking History" to view all your bookings.
2. **Cancel Booking**: From the Booking History, select a booking and click on "Cancel Booking" to cancel it.

## Administrator Guide

### Managing Users

1. **View Users**: Navigate to the Users section to view all registered users.
2. **Edit User**: Click on a user to view and edit their details.
3. **Delete User**: Click on the "Delete" button to remove a user from the system.

### Managing Inventory

1. **Flights**: Navigate to the Flights section to view, add, edit, or delete flights.
2. **Trains**: Navigate to the Trains section to view, add, edit, or delete trains.
3. **Hotels**: Navigate to the Hotels section to view, add, edit, or delete hotels.

### Managing Bookings

1. **View Bookings**: Navigate to the Bookings section to view all bookings in the system.
2. **Edit Booking**: Click on a booking to view and edit its details.
3. **Cancel Booking**: Click on the "Cancel" button to cancel a booking.

## Conclusion

The Online Booking System is a comprehensive web application that provides users with a seamless experience for booking trains, planes, and hotels. It demonstrates the application of software engineering principles in building a real-world application.

The system is designed to be user-friendly, secure, and scalable. It provides a robust backend API, a responsive frontend, and a well-structured database schema.

The project has successfully achieved its objectives and can be further enhanced with additional features such as:

1. **Social Login**: Allow users to log in using their social media accounts
2. **Reviews and Ratings**: Allow users to leave reviews and ratings for flights, trains, and hotels
3. **Notifications**: Send email or SMS notifications for booking confirmations and updates
4. **Multi-language Support**: Add support for multiple languages
5. **Advanced Search Filters**: Add more filters for search results

## References

1. Node.js Documentation: https://nodejs.org/en/docs/
2. Express.js Documentation: https://expressjs.com/
3. MongoDB Documentation: https://docs.mongodb.com/
4. Mongoose Documentation: https://mongoosejs.com/docs/
5. JWT Documentation: https://jwt.io/
6. Bootstrap Documentation: https://getbootstrap.com/docs/5.0/
7. MDN Web Docs: https://developer.mozilla.org/

