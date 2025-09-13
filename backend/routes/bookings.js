const PDFDocument = require("pdfkit");
const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Flight = require("../models/Flight");
const Train = require("../models/Train");
const Hotel = require("../models/Hotel");
const { authenticateUser } = require("../middleware/auth"); // Correctly import the authenticateUser function
const eventBus = require("../utils/eventBus");

// Create flight booking
router.post("/flights", authenticateUser, async (req, res) => {
  try {
    const { flightId, passengerDetails } = req.body;

    // Check if flight exists and has available seats
    const flight = await Flight.findById(flightId);

    if (!flight) {
      return res.status(404).json({
        error: {
          message: "Flight not found",
          status: 404,
        },
      });
    }

    if (flight.availableSeats <= 0) {
      return res.status(409).json({
        error: {
          message: "No available seats for this flight",
          status: 409,
        },
      });
    }

    // Create booking
    const booking = new Booking({
      userId: req.user._id,
      bookingType: "flight",
      totalAmount: flight.price,
      status: "confirmed", // Set status to confirmed
      paymentStatus: "completed", // Set payment status to completed
      trip: {
        type: "flight",
        destination: flight.destination,
        startDate: flight.departureTime,
        endDate: flight.arrivalTime,
        flightDetails: {
          flightId: flight._id,
          flightNumber: flight.flightNumber,
          airline: flight.airline,
          source: flight.source,
          destination: flight.destination,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          passengerDetails,
        },
      },
    });

    await booking.save();

    // Emit real-time event
    eventBus.emit('booking:created', {
      id: booking._id.toString(),
      type: 'flight',
      user: { id: req.user._id.toString(), name: req.user.name, email: req.user.email },
      amount: booking.totalAmount,
      createdAt: booking.createdAt,
      details: {
        flightNumber: flight.flightNumber,
        airline: flight.airline,
        route: `${flight.source} -> ${flight.destination}`
      }
    });

    // Update flight available seats
    flight.availableSeats -= 1;
    await flight.save();

    res.status(201).json({
      message: "Flight booking created successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
        status: 500,
      },
    });
  }
});

// Create train booking
router.post("/trains", authenticateUser, async (req, res) => {
  try {
    const { trainId, passengerDetails } = req.body;

    // Check if train exists and has available seats
    const train = await Train.findById(trainId);

    if (!train) {
      return res.status(404).json({
        error: {
          message: "Train not found",
          status: 404,
        },
      });
    }

    if (train.availableSeats <= 0) {
      return res.status(409).json({
        error: {
          message: "No available seats for this train",
          status: 409,
        },
      });
    }

    // Create booking
    const booking = new Booking({
      userId: req.user._id,
      bookingType: "train",
      totalAmount: train.price,
      status: "confirmed", // Set status to confirmed
      paymentStatus: "completed", // Set payment status to completed
      trip: {
        type: "train",
        destination: train.destination,
        startDate: train.departureTime,
        endDate: train.arrivalTime,
        trainDetails: {
          trainId: train._id,
          trainNumber: train.trainNumber,
          trainName: train.trainName,
          source: train.source,
          destination: train.destination,
          departureTime: train.departureTime,
          arrivalTime: train.arrivalTime,
          class: train.class,
          passengerDetails,
        },
      },
    });

    await booking.save();

    // Emit real-time event
    eventBus.emit('booking:created', {
      id: booking._id.toString(),
      type: 'train',
      user: { id: req.user._id.toString(), name: req.user.name, email: req.user.email },
      amount: booking.totalAmount,
      createdAt: booking.createdAt,
      details: {
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        route: `${train.source} -> ${train.destination}`
      }
    });

    // Update train available seats
    train.availableSeats -= 1;
    await train.save();

    res.status(201).json({
      message: "Train booking created successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
        status: 500,
      },
    });
  }
});

// Create hotel booking
router.post("/hotels", authenticateUser, async (req, res) => {
  try {
    const { hotelId, checkInDate, checkOutDate, guestDetails } = req.body;

    // Normalize guest details to match schema
    const normalizedGuestDetails = {
      primaryGuest: (guestDetails && (guestDetails.primaryGuest || guestDetails.name)) || (req.user && req.user.name) || 'Primary Guest',
      numberOfGuests: parseInt((guestDetails && guestDetails.numberOfGuests) || 1, 10),
      specialRequests: (guestDetails && guestDetails.specialRequests) || ''
    };

    // Check if hotel exists and has available rooms
    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({
        error: {
          message: "Hotel not found",
          status: 404,
        },
      });
    }

    if (hotel.availableRooms <= 0) {
      return res.status(409).json({
        error: {
          message: "No available rooms for this hotel",
          status: 409,
        },
      });
    }

    // Calculate number of nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      return res.status(400).json({
        error: {
          message: "Check-out date must be after check-in date",
          status: 400,
        },
      });
    }

    // Calculate total amount
    const totalAmount = hotel.price * nights;

    // Create booking
    const booking = new Booking({
      userId: req.user._id,
      bookingType: "hotel",
      totalAmount,
      status: "confirmed", // Set status to confirmed
      paymentStatus: "completed", // Set payment status to completed
      trip: {
        type: "hotel",
        destination: hotel.location,
        startDate: checkIn,
        endDate: checkOut,
        hotelDetails: {
          hotelId: hotel._id,
          name: hotel.name,
          location: hotel.location,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          nights,
          roomType: hotel.roomType,
          guestDetails: normalizedGuestDetails,
        },
      },
    });

    await booking.save();

    // Emit real-time event
    eventBus.emit('booking:created', {
      id: booking._id.toString(),
      type: 'hotel',
      user: { id: req.user._id.toString(), name: req.user.name, email: req.user.email },
      amount: booking.totalAmount,
      createdAt: booking.createdAt,
      details: {
        hotelName: hotel.name,
        location: hotel.location
      }
    });

    // Update hotel available rooms
    hotel.availableRooms -= 1;
    await hotel.save();

    res.status(201).json({
      message: "Hotel booking created successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
        status: 500,
      },
    });
  }
});

// Create multiple bookings for multiple passengers
router.post("/bulk", authenticateUser, async (req, res) => {
  try {
    const { bookingType, itemId, passengers, hotelInfo } = req.body;
    
    if (!bookingType || !itemId || !passengers || !Array.isArray(passengers)) {
      return res.status(400).json({
        error: {
          message: "Invalid request data",
          status: 400,
        },
      });
    }

    const numberOfPassengers = passengers.length;
    const bookings = [];
    
    // Check availability for all passengers first
    let item;
    switch (bookingType) {
      case 'flight':
        item = await Flight.findById(itemId);
        if (!item) {
          return res.status(404).json({
            error: { message: "Flight not found", status: 404 }
          });
        }
        if (item.availableSeats < numberOfPassengers) {
          return res.status(409).json({
            error: { 
              message: `Only ${item.availableSeats} seats available, but ${numberOfPassengers} passengers requested`, 
              status: 409 
            }
          });
        }
        break;
      case 'train':
        item = await Train.findById(itemId);
        if (!item) {
          return res.status(404).json({
            error: { message: "Train not found", status: 404 }
          });
        }
        if (item.availableSeats < numberOfPassengers) {
          return res.status(409).json({
            error: { 
              message: `Only ${item.availableSeats} seats available, but ${numberOfPassengers} passengers requested`, 
              status: 409 
            }
          });
        }
        break;
      case 'hotel':
        item = await Hotel.findById(itemId);
        if (!item) {
          return res.status(404).json({
            error: { message: "Hotel not found", status: 404 }
          });
        }
        if (item.availableRooms < 1) {
          return res.status(409).json({
            error: { 
              message: "No available rooms for this hotel", 
              status: 409 
            }
          });
        }
        break;
      default:
        return res.status(400).json({
          error: { message: "Invalid booking type", status: 400 }
        });
    }

    // Create bookings for each passenger
    for (let i = 0; i < numberOfPassengers; i++) {
      const passenger = passengers[i];
      let bookingData = {
        userId: req.user._id,
        bookingType: bookingType,
        totalAmount: item.price,
        status: "confirmed",
        paymentStatus: "completed"
      };

      // Set up trip details based on booking type
      switch (bookingType) {
        case 'flight':
          bookingData.trip = {
            type: "flight",
            destination: item.destination,
            startDate: item.departureTime,
            endDate: item.arrivalTime,
            flightDetails: {
              flightId: item._id,
              flightNumber: item.flightNumber,
              airline: item.airline,
              source: item.source,
              destination: item.destination,
              departureTime: item.departureTime,
              arrivalTime: item.arrivalTime,
              passengerDetails: passenger
            }
          };
          break;
        case 'train':
          bookingData.trip = {
            type: "train",
            destination: item.destination,
            startDate: item.departureTime,
            endDate: item.arrivalTime,
            trainDetails: {
              trainId: item._id,
              trainNumber: item.trainNumber,
              trainName: item.trainName,
              source: item.source,
              destination: item.destination,
              departureTime: item.departureTime,
              arrivalTime: item.arrivalTime,
              class: item.class,
              passengerDetails: passenger
            }
          };
          break;
        case 'hotel':
          const checkIn = new Date(hotelInfo.checkInDate);
          const checkOut = new Date(hotelInfo.checkOutDate);
          const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
          bookingData.totalAmount = item.price * nights;
          bookingData.trip = {
            type: "hotel",
            destination: item.location,
            startDate: checkIn,
            endDate: checkOut,
            hotelDetails: {
              hotelId: item._id,
              name: item.name,
              location: item.location,
              checkInDate: checkIn,
              checkOutDate: checkOut,
              nights: nights,
              roomType: item.roomType || "Standard",
              guestDetails: {
                primaryGuest: passenger.name,
                numberOfGuests: parseInt(hotelInfo.numberOfGuests || 1),
                specialRequests: hotelInfo.specialRequests || ''
              }
            }
          };
          break;
      }

      const booking = new Booking(bookingData);
      await booking.save();
      bookings.push(booking);

      // Emit real-time event for each booking
      eventBus.emit('booking:created', {
        id: booking._id.toString(),
        type: bookingType,
        user: { id: req.user._id.toString(), name: req.user.name, email: req.user.email },
        amount: booking.totalAmount,
        createdAt: booking.createdAt,
        details: bookingType === 'flight' ? {
          flightNumber: item.flightNumber,
          airline: item.airline,
          route: `${item.source} -> ${item.destination}`
        } : bookingType === 'train' ? {
          trainNumber: item.trainNumber,
          trainName: item.trainName,
          route: `${item.source} -> ${item.destination}`
        } : {
          hotelName: item.name,
          location: item.location,
          nights: bookingData.trip.hotelDetails.nights
        }
      });
    }

    // Update availability
    if (bookingType === 'flight' || bookingType === 'train') {
      item.availableSeats -= numberOfPassengers;
      await item.save();
    } else if (bookingType === 'hotel') {
      item.availableRooms -= 1;
      await item.save();
    }

    res.status(201).json({
      message: `${numberOfPassengers} booking(s) created successfully`,
      bookings: bookings.map(booking => ({
        id: booking._id,
        type: booking.bookingType,
        amount: booking.totalAmount,
        status: booking.status
      }))
    });

  } catch (error) {
    console.error('Bulk booking error:', error);
    res.status(500).json({
      error: {
        message: error.message,
        status: 500,
      },
    });
  }
});

// Process payment for booking
router.post("/:id/payment", authenticateUser, async (req, res) => {
  try {
    const { paymentMethod, paymentDetails } = req.body;

    // Find booking
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        error: {
          message: "Booking not found",
          status: 404,
        },
      });
    }

    // Check if booking belongs to user
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: {
          message: "Unauthorized. This booking does not belong to you.",
          status: 403,
        },
      });
    }

    // Check if booking is already paid
    if (booking.paymentStatus === "completed") {
      return res.status(409).json({
        error: {
          message: "Payment has already been processed for this booking",
          status: 409,
        },
      });
    }

    // In a real application, you would integrate with a payment gateway here
    // For this example, we will simulate a successful payment

    // Generate a fake payment ID
    const paymentId = "PAY_" + Math.random().toString(36).substring(2, 15);

    // Update booking
    booking.paymentStatus = "completed";
    booking.status = "confirmed";
    booking.paymentId = paymentId;

    await booking.save();

    res.status(200).json({
      message: "Payment processed successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
        status: 500,
      },
    });
  }
});

// Get user's bookings
router.get("/history", authenticateUser, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).sort({bookingDate: -1,
    });

    res.status(200).json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
        status: 500,
      },
    });
  }
});

// Get booking by ID
router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        error: {
          message: "Booking not found",
          status: 404,
        },
      });
    }

    // Check if booking belongs to user
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: {
          message: "Unauthorized. This booking does not belong to you.",
          status: 403,
        },
      });
    }

    res.status(200).json({ booking });
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
        status: 500,
      },
    });
  }
});

// Cancel booking
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        error: {
          message: "Booking not found",
          status: 404,
        },
      });
    }

    // Check if booking belongs to user
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: {
          message: "Unauthorized. This booking does not belong to you.",
          status: 403,
        },
      });
    }

    // Check if booking can be cancelled
    if (booking.status === "cancelled") {
      return res.status(409).json({
        error: {
          message: "Booking is already cancelled",
          status: 409,
        },
      });
    }

    // Update booking status
    booking.status = "cancelled";

    // If payment was completed, set to refunded
    if (booking.paymentStatus === "completed") {
      booking.paymentStatus = "refunded";
    }

    await booking.save();

    // Update available seats/rooms based on booking type
    if (booking.bookingType === "flight" && booking.trip.flightDetails) {
      const flight = await Flight.findById(booking.trip.flightDetails.flightId);
      if (flight) {
        flight.availableSeats += 1;
        await flight.save();
      }
    } else if (booking.bookingType === "train" && booking.trip.trainDetails) {
      const train = await Train.findById(booking.trip.trainDetails.trainId);
      if (train) {
        train.availableSeats += 1;
        await train.save();
      }
    } else if (booking.bookingType === "hotel" && booking.trip.hotelDetails) {
      const hotel = await Hotel.findById(booking.trip.hotelDetails.hotelId);
      if (hotel) {
        hotel.availableRooms += 1;
        await hotel.save();
      }
    }

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
        status: 500,
      },
    });
  }
});

// @route   GET /api/bookings/ticket/:bookingId
// @desc    Download booking ticket as PDF
// @access  Private
router.get("/ticket/:bookingId", authenticateUser, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    // Ensure the user requesting the ticket owns the booking
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    const doc = new PDFDocument();
    // For sending directly as response, use res.pipe(doc)
    doc.pipe(res);

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ticket_${booking._id}.pdf`
    );

    doc.fontSize(25).text("TravelEase Booking Confirmation", { align: "center" });
    doc.moveDown();

    doc.fontSize(16).text(`Booking ID: ${booking._id}`);
    doc.text(`User: ${req.user.username} (${req.user.email})`);
    doc.text(
      `Booking Date: ${new Date(booking.bookingDate).toLocaleDateString()}`
    );
    doc.moveDown();

    // Add booking details based on type
    if (booking.bookingType === "flight" && booking.trip.flightDetails) {
      doc.fontSize(14).text("Flight Details:", { underline: true });
      doc.text(`Flight Number: ${booking.trip.flightDetails.flightNumber}`);
      doc.text(`Airline: ${booking.trip.flightDetails.airline}`);
      doc.text(
        `From: ${booking.trip.flightDetails.source} To: ${booking.trip.flightDetails.destination}`
      );
      doc.text(
        `Departure: ${new Date(booking.trip.flightDetails.departureTime).toLocaleString()}`
      );
      doc.text(
        `Arrival: ${new Date(booking.trip.flightDetails.arrivalTime).toLocaleString()}`
      );
      doc.moveDown();
    }

    if (booking.bookingType === "train" && booking.trip.trainDetails) {
      doc.fontSize(14).text("Train Details:", { underline: true });
      doc.text(`Train Number: ${booking.trip.trainDetails.trainNumber}`);
      doc.text(`Train Name: ${booking.trip.trainDetails.trainName}`);
      doc.text(
        `From: ${booking.trip.trainDetails.source} To: ${booking.trip.trainDetails.destination}`
      );
      doc.text(
        `Departure: ${new Date(booking.trip.trainDetails.departureTime).toLocaleString()}`
      );
      doc.text(
        `Arrival: ${new Date(booking.trip.trainDetails.arrivalTime).toLocaleString()}`
      );
      doc.text(`Class: ${booking.trip.trainDetails.class}`);
      doc.moveDown();
    }

    if (booking.bookingType === "hotel" && booking.trip.hotelDetails) {
      doc.fontSize(14).text("Hotel Details:", { underline: true });
      doc.text(`Hotel Name: ${booking.trip.hotelDetails.name}`);
      doc.text(`Location: ${booking.trip.hotelDetails.location}`);
      doc.text(
        `Check-in: ${new Date(booking.trip.hotelDetails.checkInDate).toLocaleDateString()}`
      );
      doc.text(
        `Check-out: ${new Date(booking.trip.hotelDetails.checkOutDate).toLocaleDateString()}`
      );
      doc.text(`Nights: ${booking.trip.hotelDetails.nights}`);
      doc.text(`Room Type: ${booking.trip.hotelDetails.roomType}`);
      doc.moveDown();
    }

    doc.fontSize(16).text(`Total Amount: ₹${booking.totalAmount}`, { align: "right" });
    doc.fontSize(12).text(`Status: ${booking.status}`, { align: "right" });
    doc.text(`Payment Status: ${booking.paymentStatus}`, { align: "right" });

    doc.end();
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Cancel booking
router.put("/:id/cancel", authenticateUser, async (req, res) => {
  try {
    const { reason } = req.body;
    const bookingId = req.params.id;

    // Find the booking
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        error: {
          message: "Booking not found",
          status: 404
        }
      });
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: {
          message: "Access denied. You can only cancel your own bookings.",
          status: 403
        }
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        error: {
          message: "Booking is already cancelled",
          status: 400
        }
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        error: {
          message: "Cannot cancel completed booking",
          status: 400
        }
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
    
    // If payment was completed, set to refunded
    if (booking.paymentStatus === "completed") {
      booking.paymentStatus = "refunded";
    }
    
    await booking.save();

    // Update available seats/rooms based on booking type
    if (booking.bookingType === "flight" && booking.trip.flightDetails) {
      const flight = await Flight.findById(booking.trip.flightDetails.flightId);
      if (flight) {
        flight.availableSeats += 1;
        await flight.save();
      }
    } else if (booking.bookingType === "train" && booking.trip.trainDetails) {
      const train = await Train.findById(booking.trip.trainDetails.trainId);
      if (train) {
        train.availableSeats += 1;
        await train.save();
      }
    } else if (booking.bookingType === "hotel" && booking.trip.hotelDetails) {
      const hotel = await Hotel.findById(booking.trip.hotelDetails.hotelId);
      if (hotel) {
        hotel.availableRooms += 1;
        await hotel.save();
      }
    }

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking: {
        id: booking._id,
        status: booking.status,
        cancellationReason: booking.cancellationReason,
        cancelledAt: booking.cancelledAt,
        paymentStatus: booking.paymentStatus
      }
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      error: {
        message: error.message,
        status: 500
      }
    });
  }
});

module.exports = router;

