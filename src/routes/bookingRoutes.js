const express = require('express');
const { createBooking, payBooking, getBookingById, getMyBookings, cancelBooking, deleteBooking } = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createBooking);
router.post('/:id/pay', authMiddleware, payBooking);
router.get('/my', authMiddleware, getMyBookings);
router.get('/:id', authMiddleware, getBookingById);
router.put('/:id/cancel', authMiddleware, cancelBooking);
router.delete('/:id', authMiddleware, deleteBooking);

module.exports = router;
