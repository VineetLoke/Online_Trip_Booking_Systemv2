// Add New Records Script for Online Booking System
// This script adds new flights, trains, and hotels with future dates

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'online_booking_system';

async function addNewRecords() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    console.log('Adding new records with future dates...');
    
    // Add new flights
    const newFlights = [
      {
        flightNumber: "AI201",
        airline: "Air India",
        source: "Mumbai",
        destination: "Delhi",
        departureTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        arrivalTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000), // 2.5 hours later
        price: 4800,
        availableSeats: 120,
        totalSeats: 150,
        aircraft: "Boeing 737",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        flightNumber: "6E301",
        airline: "IndiGo",
        source: "Bangalore",
        destination: "Mumbai",
        departureTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        arrivalTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000), // 1.5 hours later
        price: 3800,
        availableSeats: 100,
        totalSeats: 120,
        aircraft: "Airbus A320",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        flightNumber: "SG401",
        airline: "SpiceJet",
        source: "Goa",
        destination: "Delhi",
        departureTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        arrivalTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000), // 2.5 hours later
        price: 5200,
        availableSeats: 80,
        totalSeats: 100,
        aircraft: "Boeing 737",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('flights').insertMany(newFlights);
    console.log(`Added ${newFlights.length} new flights`);
    
    // Add new trains
    const newTrains = [
      {
        trainNumber: "12346",
        trainName: "Shatabdi Express",
        source: "Mumbai",
        destination: "Delhi",
        departureTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 5 days from now at 6:00 AM
        arrivalTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000), // Same day at 6:00 PM
        price: 3200,
        availableSeats: 150,
        totalSeats: 200,
        class: "AC Chair Car",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        trainNumber: "12628",
        trainName: "Tamil Nadu Express",
        source: "Delhi",
        destination: "Chennai",
        departureTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000), // 6 days from now at 8:00 PM
        arrivalTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 2 days later at 6:00 AM
        price: 2100,
        availableSeats: 180,
        totalSeats: 250,
        class: "AC 3-Tier",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('trains').insertMany(newTrains);
    console.log(`Added ${newTrains.length} new trains`);
    
    // Add new hotels
    const newHotels = [
      {
        name: "Taj Palace Delhi",
        location: "Delhi",
        address: "2, Sardar Patel Marg, New Delhi",
        price: 8500,
        rating: 4.9,
        amenities: ["WiFi", "Spa", "Pool", "Restaurant", "Bar", "Conference Room", "Gym"],
        availableRooms: 30,
        totalRooms: 60,
        roomType: "Luxury Suite",
        images: ["taj1.jpg", "taj2.jpg"],
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "ITC Gardenia Bangalore",
        location: "Bangalore",
        address: "Residency Road, Bangalore",
        price: 6500,
        rating: 4.7,
        amenities: ["WiFi", "Spa", "Pool", "Restaurant", "Bar", "Business Center"],
        availableRooms: 25,
        totalRooms: 50,
        roomType: "Executive Suite",
        images: ["itc1.jpg", "itc2.jpg"],
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Leela Palace Chennai",
        location: "Chennai",
        address: "Adyar Sea Face, Chennai",
        price: 7200,
        rating: 4.8,
        amenities: ["WiFi", "Beach Access", "Pool", "Restaurant", "Spa", "Water Sports"],
        availableRooms: 20,
        totalRooms: 40,
        roomType: "Ocean View Suite",
        images: ["leela1.jpg", "leela2.jpg"],
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('hotels').insertMany(newHotels);
    console.log(`Added ${newHotels.length} new hotels`);
    
    console.log('New records added successfully!');
    console.log('You now have more flights, trains, and hotels with future dates.');
    
  } catch (error) {
    console.error('Error adding new records:', error);
  } finally {
    await client.close();
  }
}

// Run the script
addNewRecords();
