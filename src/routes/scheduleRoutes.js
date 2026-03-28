// Schedule endpoints
const express = require('express');
const { getSchedules } = require('../controllers/scheduleController');

const router = express.Router();

router.get('/', getSchedules); // Search available buses

module.exports = router;
