// Booking endpoints — protected by auth middleware
const express = require('express');
const { createBooking, getMyBookings } = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createBooking);       // Book a seat
router.get('/my', authMiddleware, getMyBookings);      // Get my tickets

module.exports = router;
