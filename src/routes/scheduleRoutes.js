// Schedule endpoints
const express = require('express');
const { getSchedules, getScheduleSeats } = require('../controllers/scheduleController');
const { addSchedule, updateSchedule, deleteSchedule } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', getSchedules);
router.post('/', authMiddleware, adminMiddleware, addSchedule);
router.get('/:id/seats', getScheduleSeats);
router.put('/:id', authMiddleware, adminMiddleware, updateSchedule);
router.delete('/:id', authMiddleware, adminMiddleware, deleteSchedule);

module.exports = router;
