// Bus endpoints
const express = require('express');
const { getAllBuses, getBusById, getBusSeats, getBusSchedule, getBusLocation, updateBusLocation } = require('../controllers/busLocationController');
const { addBus, updateBus, deleteBus } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', getAllBuses);
router.post('/', authMiddleware, adminMiddleware, addBus);
router.get('/:id', getBusById);
router.put('/:id', authMiddleware, adminMiddleware, updateBus);
router.delete('/:id', authMiddleware, adminMiddleware, deleteBus);
router.get('/:id/seats', getBusSeats);
router.get('/:id/schedule', getBusSchedule);
router.get('/:id/location', getBusLocation);
router.put('/:id/location', updateBusLocation);

module.exports = router;
