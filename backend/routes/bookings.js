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

    // Input validation
    if (!flightId || typeof flightId !== 'string') {
      return res.status(400).json({
        error: {
          message: "Valid flight ID is required",
          status: 400,
        },
      });
    }

    if (!passengerDetails || typeof passengerDetails !== 'object') {
      return res.status(400).json({
        error: {
          message: "Passenger details are required",
          status: 400,
        },
      });
    }

    if (!passengerDetails.name || passengerDetails.name.trim().length < 2) {
      return res.status(400).json({
        error: {
          message: "Passenger name must be at least 2 characters long",
          status: 400,
        },
      });
    }

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
        message: "Internal server error",
        status: 500,
        details: error.message
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
        message: "Internal server error",
        status: 500,
        details: error.message
      },
    });
  }
});

// Create hotel booking
router.post("/hotels", authenticateUser, async (req, res) => {
  try {
    const { hotelId, checkInDate, checkOutDate, guestDetails } = req.body;

    // Input validation
    if (!hotelId || typeof hotelId !== 'string') {
      return res.status(400).json({
        error: {
          message: "Valid hotel ID is required",
          status: 400,
        },
      });
    }

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        error: {
          message: "Check-in and check-out dates are required",
          status: 400,
        },
      });
    }

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({
        error: {
          message: "Invalid date format",
          status: 400,
        },
      });
    }

    if (checkIn < today) {
      return res.status(400).json({
        error: {
          message: "Check-in date cannot be in the past",
          status: 400,
        },
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        error: {
          message: "Check-out date must be after check-in date",
          status: 400,
        },
      });
    }

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
        message: "Internal server error",
        status: 500,
        details: error.message
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
          const hotelCheckIn = new Date(hotelInfo.checkInDate);
          const hotelCheckOut = new Date(hotelInfo.checkOutDate);
          const nights = Math.ceil((hotelCheckOut - hotelCheckIn) / (1000 * 60 * 60 * 24));
          bookingData.totalAmount = item.price * nights;
          bookingData.trip = {
            type: "hotel",
            destination: item.location,
            startDate: hotelCheckIn,
            endDate: hotelCheckOut,
            hotelDetails: {
              hotelId: item._id,
              name: item.name,
              location: item.location,
              checkInDate: hotelCheckIn,
              checkOutDate: hotelCheckOut,
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
        message: "Internal server error",
        status: 500,
        details: error.message
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
        message: "Internal server error",
        status: 500,
        details: error.message
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
        message: "Internal server error",
        status: 500,
        details: error.message
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
        message: "Internal server error",
        status: 500,
        details: error.message
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
        message: "Internal server error",
        status: 500,
        details: error.message
      },
    });
  }
});

// @route   GET /api/bookings/ticket/:bookingId
// @desc    Download booking ticket as PDF with professional design and multiple passenger support
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

    // Find all related bookings for the same trip (group bookings)
    const relatedBookings = await Booking.find({
      userId: req.user._id,
      bookingType: booking.bookingType,
      'trip.startDate': booking.trip.startDate,
      'trip.destination': booking.trip.destination,
      bookingDate: {
        $gte: new Date(booking.bookingDate.getTime() - 5 * 60000), // 5 minutes before
        $lte: new Date(booking.bookingDate.getTime() + 5 * 60000)  // 5 minutes after
      }
    }).sort({ createdAt: 1 });

    const isGroupBooking = relatedBookings.length > 1;
    const primaryBooking = relatedBookings[0] || booking;
    const totalGroupAmount = relatedBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ticket_${isGroupBooking ? 'group_' : ''}${primaryBooking._id}.pdf`
    );

    // Professional PDF Layout
    await generateProfessionalTicketPDF(doc, relatedBookings, req.user, isGroupBooking, totalGroupAmount);

    doc.end();
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Helper function to generate professional PDF
async function generateProfessionalTicketPDF(doc, bookings, user, isGroupBooking, totalAmount) {
  const primaryBooking = bookings[0];
  const pageWidth = doc.page.width - 100; // Account for margins
  const pageHeight = doc.page.height - 100;
  let yPosition = 60;

  // Enhanced header with gradient background
  const headerHeight = 120;
  
  // Main header background
  doc.rect(50, 40, pageWidth, headerHeight)
     .fillAndStroke('#1a73e8', '#1a73e8');
  
  // Add subtle gradient effect with overlapping rectangles
  doc.rect(50, 40, pageWidth, 40)
     .fillAndStroke('rgba(26, 115, 232, 0.9)', 'rgba(26, 115, 232, 0.9)');
  
  // Company branding section
  doc.fillColor('white')
     .fontSize(32)
     .font('Helvetica-Bold')
     .text('TravelEase', 70, 60);
  
  doc.fontSize(16)
     .font('Helvetica')
     .text('Your Premium Travel Partner', 70, 100);
  
  // Booking type badge in top right
  const badgeText = primaryBooking.bookingType.toUpperCase();
  const badgeWidth = 100;
  doc.rect(pageWidth - badgeWidth + 30, 50, badgeWidth, 30)
     .fillAndStroke('#ff6b35', '#ff6b35');
  doc.fillColor('white')
     .fontSize(14)
     .font('Helvetica-Bold')
     .text(badgeText, pageWidth - badgeWidth + 40, 63);
  
  // Status indicator
  const statusColor = primaryBooking.status === 'confirmed' ? '#28a745' : '#ffc107';
  doc.rect(pageWidth - badgeWidth + 30, 85, badgeWidth, 25)
     .fillAndStroke(statusColor, statusColor);
  doc.fillColor('white')
     .fontSize(12)
     .text(primaryBooking.status.toUpperCase(), pageWidth - badgeWidth + 45, 93);

  yPosition = 180;

  // Booking confirmation title with decorative elements
  doc.fillColor('#2c3e50')
     .fontSize(28)
     .font('Helvetica-Bold')
     .text(isGroupBooking ? 'GROUP BOOKING' : 'BOOKING CONFIRMATION', 50, yPosition);
  
  // Decorative line under title
  doc.moveTo(50, yPosition + 40)
     .lineTo(pageWidth + 50, yPosition + 40)
     .lineWidth(3)
     .strokeColor('#1a73e8')
     .stroke();

  yPosition += 60;

  // Booking reference section with enhanced styling
  const refSectionHeight = 100;
  doc.roundedRect(50, yPosition, pageWidth, refSectionHeight, 10)
     .fillAndStroke('#f8f9fa', '#e9ecef');
  
  // Booking ID with prominent display
  doc.fillColor('#495057')
     .fontSize(14)
     .font('Helvetica-Bold')
     .text('BOOKING REFERENCE', 70, yPosition + 20);
  
  doc.fillColor('#1a73e8')
     .fontSize(22)
     .font('Helvetica-Bold')
     .text(primaryBooking._id.toString().slice(-8).toUpperCase(), 70, yPosition + 45);
  
  // Customer details in right column with icons
  const customerX = 320;
  doc.fillColor('#495057')
     .fontSize(14)
     .font('Helvetica-Bold')
     .text('CUSTOMER DETAILS', customerX, yPosition + 20);
  
  doc.fillColor('#2c3e50')
     .fontSize(16)
     .font('Helvetica-Bold')
     .text(user.name, customerX, yPosition + 45);
  
  doc.fillColor('#6c757d')
     .fontSize(12)
     .font('Helvetica')
     .text(`Email: ${user.email}`, customerX, yPosition + 70);

  yPosition += refSectionHeight + 30;

  // Quick info section
  const infoSectionHeight = 60;
  doc.roundedRect(50, yPosition, pageWidth, infoSectionHeight, 8)
     .fillAndStroke('#e3f2fd', '#bbdefb');
  
  const infoItems = [
    { icon: 'Booked:', label: 'Booked', value: new Date(primaryBooking.bookingDate).toLocaleDateString('en-IN') },
    { icon: 'Payment:', label: 'Payment', value: primaryBooking.paymentStatus.toUpperCase() },
    { icon: 'Amount:', label: 'Amount', value: `₹${totalAmount.toLocaleString('en-IN')}` }
  ];
  
  infoItems.forEach((item, index) => {
    const itemX = 70 + (index * (pageWidth / 3));
    doc.fillColor('#1565c0')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text(`${item.icon} ${item.label}`, itemX, yPosition + 20);
    
    doc.fillColor('#0d47a1')
       .fontSize(14)
       .font('Helvetica')
       .text(item.value, itemX, yPosition + 38);
  });

  yPosition += infoSectionHeight + 40;

  // Check if we need a new page before trip details
  if (yPosition > pageHeight - 200) {
    doc.addPage();
    yPosition = 60;
  }

  // Trip details section with enhanced design
  const tripHeaderHeight = 50;
  doc.roundedRect(50, yPosition, pageWidth, tripHeaderHeight, 8)
     .fillAndStroke('#1a73e8', '#1a73e8');
  
  doc.fillColor('white')
     .fontSize(20)
     .font('Helvetica-Bold')
     .text(`${primaryBooking.bookingType.toUpperCase()} JOURNEY`, 70, yPosition + 15);

  yPosition += tripHeaderHeight + 20;
  
  // Add specific trip details based on booking type
  if (primaryBooking.bookingType === 'flight') {
    yPosition = addEnhancedFlightDetails(doc, primaryBooking, yPosition, pageWidth);
  } else if (primaryBooking.bookingType === 'train') {
    yPosition = addEnhancedTrainDetails(doc, primaryBooking, yPosition, pageWidth);
  } else if (primaryBooking.bookingType === 'hotel') {
    yPosition = addEnhancedHotelDetails(doc, primaryBooking, yPosition, pageWidth);
  }

  // Check if we need a new page before passenger details
  if (yPosition > pageHeight - 150) {
    doc.addPage();
    yPosition = 60;
  }

  // Passengers section with modern card design
  if (isGroupBooking || (primaryBooking.trip.flightDetails?.passengerDetails || primaryBooking.trip.trainDetails?.passengerDetails)) {
    const passengerHeaderHeight = 50;
    doc.roundedRect(50, yPosition, pageWidth, passengerHeaderHeight, 8)
       .fillAndStroke('#28a745', '#28a745');
    
    doc.fillColor('white')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text(isGroupBooking ? `PASSENGERS (${bookings.length})` : 'PASSENGER DETAILS', 70, yPosition + 15);

    yPosition += passengerHeaderHeight + 20;
    yPosition = addEnhancedPassengerDetails(doc, bookings, yPosition, pageWidth, isGroupBooking);
  }

  // Check if we need a new page before payment summary
  if (yPosition > pageHeight - 120) {
    doc.addPage();
    yPosition = 60;
  }

  // Payment summary with modern styling
  yPosition += 30;
  const paymentHeaderHeight = 40;
  doc.roundedRect(50, yPosition, pageWidth, paymentHeaderHeight, 8)
     .fillAndStroke('#6f42c1', '#6f42c1');
  
  doc.fillColor('white')
     .fontSize(18)
     .font('Helvetica-Bold')
     .text('PAYMENT SUMMARY', 70, yPosition + 12);

  yPosition += paymentHeaderHeight + 20;
  
  const paymentBgHeight = isGroupBooking ? (bookings.length * 25) + 80 : 80;
  doc.roundedRect(50, yPosition, pageWidth, paymentBgHeight, 8)
     .fillAndStroke('#f8f9fa', '#dee2e6');
  
  if (isGroupBooking) {
    // Show breakdown for group booking
    doc.fillColor('#495057')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Breakdown:', 70, yPosition + 20);
    
    let breakdownY = yPosition + 45;
    bookings.forEach((booking, index) => {
      doc.fillColor('#6c757d')
         .fontSize(12)
         .font('Helvetica')
         .text(`Passenger ${index + 1}:`, 90, breakdownY)
         .text(`₹${booking.totalAmount.toLocaleString('en-IN')}`, pageWidth - 50, breakdownY);
      breakdownY += 25;
    });
    
    // Separator line
    doc.moveTo(70, breakdownY)
       .lineTo(pageWidth + 30, breakdownY)
       .lineWidth(2)
       .strokeColor('#dee2e6')
       .stroke();
    
    breakdownY += 15;
    
    // Total amount
    doc.fillColor('#1a73e8')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('TOTAL AMOUNT:', 70, breakdownY)
       .text(`₹${totalAmount.toLocaleString('en-IN')}`, pageWidth - 80, breakdownY);
  } else {
    // Single booking amount
    doc.fillColor('#1a73e8')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text('TOTAL AMOUNT:', 70, yPosition + 35)
       .text(`₹${totalAmount.toLocaleString('en-IN')}`, pageWidth - 80, yPosition + 35);
  }

  yPosition += paymentBgHeight + 40;

  // Check if we need a new page for footer
  if (yPosition > pageHeight - 140) {
    doc.addPage();
    yPosition = 60;
  }

  // Important information with modern alert design
  const alertHeight = 120;
  doc.roundedRect(50, yPosition, pageWidth, alertHeight, 8)
     .fillAndStroke('#fff3cd', '#ffc107');
  
  doc.fillColor('#856404')
     .fontSize(16)
     .font('Helvetica-Bold')
     .text('IMPORTANT TRAVEL INFORMATION', 70, yPosition + 15);
  
  const importantNotes = [
    '• Carry valid government-issued photo ID during travel',
    '• Arrive 2 hours early for flights, 30 minutes for trains',
    '• This is an e-ticket - no need to print',
    '• Check latest travel guidelines before departure'
  ];
  
  importantNotes.forEach((note, index) => {
    doc.fillColor('#856404')
       .fontSize(11)
       .font('Helvetica')
       .text(note, 70, yPosition + 45 + (index * 15));
  });

  yPosition += alertHeight + 30;

  // Modern footer with enhanced styling
  const footerHeight = 80;
  doc.roundedRect(50, yPosition, pageWidth, footerHeight, 8)
     .fillAndStroke('#2c3e50', '#2c3e50');
  
  // Thank you message
  doc.fillColor('white')
     .fontSize(16)
     .font('Helvetica-Bold')
     .text('Thank you for choosing TravelEase!', 70, yPosition + 15);
  
  // Support information
  doc.fontSize(12)
     .font('Helvetica')
     .text('Phone: 24/7 Support: +91-1234567890  |  Email: support@travelease.com', 70, yPosition + 40);
  
  // Generation timestamp
  doc.fontSize(10)
     .fillColor('#adb5bd')
     .text(`Generated: ${new Date().toLocaleString('en-IN')}`, 70, yPosition + 58);
  
  // QR code placeholder with modern styling
  doc.roundedRect(pageWidth - 60, yPosition + 10, 50, 50, 5)
     .stroke('#ffffff');
  doc.fillColor('white')
     .fontSize(8)
     .text('QR', pageWidth - 45, yPosition + 30)
     .text('CODE', pageWidth - 50, yPosition + 40);
}

function addEnhancedFlightDetails(doc, booking, yPosition, pageWidth) {
  const flight = booking.trip.flightDetails;
  const cardHeight = 140;
  
  // Main flight card with modern styling
  doc.roundedRect(50, yPosition, pageWidth, cardHeight, 10)
     .fillAndStroke('#ffffff', '#e3f2fd');
  
  // Flight route with enhanced typography
  const routeY = yPosition + 25;
  doc.fillColor('#1a73e8')
     .fontSize(24)
     .font('Helvetica-Bold')
     .text(flight.source, 70, routeY);
  
  // Arrow with enhanced styling
  doc.fillColor('#6c757d')
     .fontSize(20)
     .text('Flight', (pageWidth / 2) + 20, routeY);
  
  doc.fillColor('#1a73e8')
     .fontSize(24)
     .font('Helvetica-Bold')
     .text(flight.destination, pageWidth - 80, routeY);
  
  // Flight details in structured grid
  const detailsY = routeY + 45;
  const detailsData = [
    { icon: 'Airline:', label: 'Airline', value: flight.airline },
    { icon: 'Flight:', label: 'Flight', value: flight.flightNumber },
    { icon: 'Departure:', label: 'Departure', value: new Date(flight.departureTime).toLocaleString('en-IN') },
    { icon: 'Arrival:', label: 'Arrival', value: new Date(flight.arrivalTime).toLocaleString('en-IN') }
  ];
  
  detailsData.forEach((detail, index) => {
    const x = 70 + (index % 2) * (pageWidth / 2);
    const y = detailsY + Math.floor(index / 2) * 35;
    
    doc.fillColor('#495057')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text(`${detail.icon} ${detail.label}:`, x, y);
    
    doc.fillColor('#2c3e50')
       .fontSize(12)
       .font('Helvetica')
       .text(detail.value, x, y + 15);
  });
  
  return yPosition + cardHeight + 20;
}

function addEnhancedTrainDetails(doc, booking, yPosition, pageWidth) {
  const train = booking.trip.trainDetails;
  const cardHeight = 140;
  
  // Main train card with modern styling
  doc.roundedRect(50, yPosition, pageWidth, cardHeight, 10)
     .fillAndStroke('#ffffff', '#e8f5e8');
  
  // Train route with enhanced typography
  const routeY = yPosition + 25;
  doc.fillColor('#28a745')
     .fontSize(24)
     .font('Helvetica-Bold')
     .text(train.source, 70, routeY);
  
  // Arrow with train icon
  doc.fillColor('#6c757d')
     .fontSize(20)
     .text('Train', (pageWidth / 2) + 20, routeY);
  
  doc.fillColor('#28a745')
     .fontSize(24)
     .font('Helvetica-Bold')
     .text(train.destination, pageWidth - 80, routeY);
  
  // Train details in structured grid
  const detailsY = routeY + 45;
  const detailsData = [
    { icon: 'Train:', label: 'Train', value: `${train.trainName} (${train.trainNumber})` },
    { icon: 'Class:', label: 'Class', value: train.class },
    { icon: 'Departure:', label: 'Departure', value: new Date(train.departureTime).toLocaleString('en-IN') },
    { icon: 'Arrival:', label: 'Arrival', value: new Date(train.arrivalTime).toLocaleString('en-IN') }
  ];
  
  detailsData.forEach((detail, index) => {
    const x = 70 + (index % 2) * (pageWidth / 2);
    const y = detailsY + Math.floor(index / 2) * 35;
    
    doc.fillColor('#495057')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text(`${detail.icon} ${detail.label}:`, x, y);
    
    doc.fillColor('#2c3e50')
       .fontSize(12)
       .font('Helvetica')
       .text(detail.value, x, y + 15);
  });
  
  return yPosition + cardHeight + 20;
}

function addEnhancedHotelDetails(doc, booking, yPosition, pageWidth) {
  const hotel = booking.trip.hotelDetails;
  const cardHeight = 140;
  
  // Main hotel card with modern styling
  doc.roundedRect(50, yPosition, pageWidth, cardHeight, 10)
     .fillAndStroke('#ffffff', '#fff3e0');
  
  // Hotel name with enhanced typography
  const nameY = yPosition + 25;
  doc.fillColor('#ff6b35')
     .fontSize(20)
     .font('Helvetica-Bold')
     .text(`Hotel: ${hotel.name}`, 70, nameY);
  
  doc.fillColor('#6c757d')
     .fontSize(14)
     .font('Helvetica')
     .text(`Location: ${hotel.location}`, 70, nameY + 25);
  
  // Hotel details in structured grid
  const detailsY = nameY + 55;
  const detailsData = [
    { icon: 'Room:', label: 'Room Type', value: hotel.roomType },
    { icon: 'Nights:', label: 'Nights', value: hotel.nights.toString() },
    { icon: 'Check-in:', label: 'Check-in', value: new Date(hotel.checkInDate).toLocaleDateString('en-IN') },
    { icon: 'Check-out:', label: 'Check-out', value: new Date(hotel.checkOutDate).toLocaleDateString('en-IN') }
  ];
  
  detailsData.forEach((detail, index) => {
    const x = 70 + (index % 2) * (pageWidth / 2);
    const y = detailsY + Math.floor(index / 2) * 25;
    
    doc.fillColor('#495057')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text(`${detail.icon} ${detail.label}:`, x, y);
    
    doc.fillColor('#2c3e50')
       .fontSize(12)
       .font('Helvetica')
       .text(detail.value, x, y + 15);
  });
  
  return yPosition + cardHeight + 20;
}

function addEnhancedPassengerDetails(doc, bookings, yPosition, pageWidth, isGroupBooking) {
  if (isGroupBooking) {
    // Show all passengers in modern card layout
    bookings.forEach((booking, index) => {
      const passenger = booking.trip.flightDetails?.passengerDetails || 
                       booking.trip.trainDetails?.passengerDetails ||
                       booking.trip.hotelDetails?.guestDetails;
      
      if (passenger) {
        const cardHeight = 80;
        
        // Individual passenger card
        doc.roundedRect(50, yPosition, pageWidth, cardHeight, 8)
           .fillAndStroke('#f8f9fa', '#dee2e6');
        
        // Passenger number badge
        doc.roundedRect(60, yPosition + 10, 40, 25, 12)
           .fillAndStroke('#17a2b8', '#17a2b8');
        
        doc.fillColor('white')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text(`P${index + 1}`, 75, yPosition + 18);
        
        // Passenger details
        const detailsX = 120;
        const name = passenger.name || passenger.primaryGuest || 'Passenger';
        
        doc.fillColor('#2c3e50')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text(name, detailsX, yPosition + 15);
        
        const details = [];
        if (passenger.age) details.push(`Age: ${passenger.age}`);
        if (passenger.gender) details.push(`Gender: ${passenger.gender}`);
        if (passenger.seat || passenger.seatNumber) details.push(`Seat: ${passenger.seat || passenger.seatNumber}`);
        
        doc.fillColor('#6c757d')
           .fontSize(11)
           .font('Helvetica')
           .text(details.join(' • '), detailsX, yPosition + 35);
        
        yPosition += cardHeight + 15;
      }
    });
  } else {
    // Show single passenger in enhanced card
    const passenger = bookings[0].trip.flightDetails?.passengerDetails || 
                     bookings[0].trip.trainDetails?.passengerDetails ||
                     bookings[0].trip.hotelDetails?.guestDetails;
    
    if (passenger) {
      const cardHeight = 100;
      
      doc.roundedRect(50, yPosition, pageWidth, cardHeight, 10)
         .fillAndStroke('#e3f2fd', '#bbdefb');
      
      const name = passenger.name || passenger.primaryGuest || 'Passenger';
      
      doc.fillColor('#1565c0')
         .fontSize(18)
         .font('Helvetica-Bold')
         .text(`Passenger: ${name}`, 70, yPosition + 20);
      
      const passengerDetails = [];
      if (passenger.age) passengerDetails.push({ icon: 'Age:', label: 'Age', value: passenger.age.toString() });
      if (passenger.gender) passengerDetails.push({ icon: 'Gender:', label: 'Gender', value: passenger.gender });
      if (passenger.seat || passenger.seatNumber) passengerDetails.push({ icon: 'Seat:', label: 'Seat', value: passenger.seat || passenger.seatNumber });
      if (passenger.idType && passenger.idNumber) passengerDetails.push({ icon: 'ID:', label: 'ID', value: `${passenger.idType} - ${passenger.idNumber}` });
      
      passengerDetails.forEach((detail, index) => {
        const x = 70 + (index % 3) * 160;
        const y = yPosition + 50 + Math.floor(index / 3) * 25;
        
        doc.fillColor('#1565c0')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(`${detail.icon} ${detail.label}:`, x, y);
        
        doc.fillColor('#0d47a1')
           .fontSize(12)
           .font('Helvetica')
           .text(detail.value, x, y + 12);
      });
      
      yPosition += cardHeight;
    }
  }
  
  return yPosition + 20;
}


// @route   POST /api/bookings/group-ticket
// @desc    Download group booking ticket as PDF for multiple bookings
// @access  Private
router.post("/group-ticket", authenticateUser, async (req, res) => {
  try {
    const { bookingIds } = req.body;

    if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({ 
        error: { 
          message: "Please provide an array of booking IDs", 
          status: 400 
        } 
      });
    }

    // Find all bookings
    const bookings = await Booking.find({
      _id: { $in: bookingIds },
      userId: req.user._id
    }).sort({ createdAt: 1 });

    if (bookings.length === 0) {
      return res.status(404).json({ 
        error: { 
          message: "No bookings found", 
          status: 404 
        } 
      });
    }

    // Verify all bookings belong to the user
    const unauthorizedBooking = bookings.find(booking => 
      booking.userId.toString() !== req.user._id.toString()
    );
    
    if (unauthorizedBooking) {
      return res.status(401).json({ 
        error: { 
          message: "Unauthorized access to booking", 
          status: 401 
        } 
      });
    }

    const totalGroupAmount = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const isGroupBooking = bookings.length > 1;

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=group_ticket_${bookings[0]._id}_${bookings.length}passengers.pdf`
    );

    // Generate professional PDF
    await generateProfessionalTicketPDF(doc, bookings, req.user, isGroupBooking, totalGroupAmount);

    doc.end();
  } catch (err) {
    console.error('Group ticket generation error:', err.message);
    res.status(500).json({ 
      error: { 
        message: "Failed to generate group ticket", 
        status: 500 
      } 
    });
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

