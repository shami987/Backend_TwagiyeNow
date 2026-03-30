// Booking endpoints — protected by auth middleware
const express = require('express');
const { createBooking, payBooking, getBookingById, getMyBookings, cancelBooking } = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createBooking);            // Create booking
router.post('/:id/pay', authMiddleware, payBooking);        // Confirm payment
router.get('/my', authMiddleware, getMyBookings);           // Get my bookings
router.get('/:id', authMiddleware, getBookingById);         // Get booking by ID
router.put('/:id/cancel', authMiddleware, cancelBooking);   // Cancel booking

module.exports = router;
