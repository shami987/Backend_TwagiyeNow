// Schedule endpoints
const express = require('express');
const { getSchedules, getScheduleSeats } = require('../controllers/scheduleController');

const router = express.Router();

router.get('/', getSchedules);
router.get('/:id/seats', getScheduleSeats);

module.exports = router;
