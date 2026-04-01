// Private cars endpoints
const express = require('express');
const { getPrivateCars, bookPrivateCar, payPrivateCarBooking, getMyCarBookings, cancelCarBooking } = require('../controllers/privateCarController');
const { addPrivateCar, deletePrivateCar } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', getPrivateCars);                                              // List available cars
router.post('/book', authMiddleware, bookPrivateCar);                         // Book a car
router.post('/book/:id/pay', authMiddleware, payPrivateCarBooking);           // Pay for booking
router.get('/my-bookings', authMiddleware, getMyCarBookings);                 // My car bookings
router.put('/book/:id/cancel', authMiddleware, cancelCarBooking);             // Cancel booking
router.post('/', authMiddleware, adminMiddleware, addPrivateCar);             // Admin: add car
router.delete('/:id', authMiddleware, adminMiddleware, deletePrivateCar);     // Admin: delete car

module.exports = router;
