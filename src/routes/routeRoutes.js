// Routes endpoints
const express = require('express');
const { getRoutes, getRouteById, searchRoutes, getBusesByRoute } = require('../controllers/routeController');
const { addRoute, updateRoute, deleteRoute } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/search', searchRoutes);
router.get('/', getRoutes);
router.post('/', authMiddleware, adminMiddleware, addRoute);
router.get('/:id', getRouteById);
router.put('/:id', authMiddleware, adminMiddleware, updateRoute);
router.delete('/:id', authMiddleware, adminMiddleware, deleteRoute);
router.get('/:id/buses', getBusesByRoute);

module.exports = router;
