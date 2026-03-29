// Routes endpoints
const express = require('express');
const { getRoutes, getRouteById, searchRoutes, getBusesByRoute } = require('../controllers/routeController');

const router = express.Router();

router.get('/search', searchRoutes);        // Search routes by origin, destination, date
router.get('/', getRoutes);                 // List all routes
router.get('/:id', getRouteById);           // Get a single route
router.get('/:id/buses', getBusesByRoute);  // List all buses for a route

module.exports = router;
