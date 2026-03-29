// Bus endpoints
const express = require('express');
const { getAllBuses, getBusById, getBusSeats, getBusSchedule, getBusLocation, updateBusLocation } = require('../controllers/busLocationController');

const router = express.Router();

router.get('/', getAllBuses);                    // List all buses
router.get('/:id', getBusById);                 // Get a single bus
router.get('/:id/seats', getBusSeats);          // Real-time seat availability
router.get('/:id/schedule', getBusSchedule);    // Departure and arrival schedule
router.get('/:id/location', getBusLocation);    // Get bus GPS location
router.put('/:id/location', updateBusLocation); // Update bus GPS location

module.exports = router;
