// Routes endpoints
const express = require('express');
const { getRoutes } = require('../controllers/routeController');

const router = express.Router();

router.get('/', getRoutes); // List all routes

module.exports = router;
