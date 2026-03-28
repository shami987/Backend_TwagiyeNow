// Admin endpoints — protected by auth + admin middleware
const express = require('express');
const { addRoute, addBus, addSchedule, getBuses } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Apply both middlewares to all admin routes
router.use(authMiddleware, adminMiddleware);

router.post('/routes', addRoute);       // Add a route
router.post('/buses', addBus);          // Add a bus
router.get('/buses', getBuses);         // List all buses
router.post('/schedules', addSchedule); // Add a schedule

module.exports = router;
