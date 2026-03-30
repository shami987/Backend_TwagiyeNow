const express = require('express');
const { addRoute, updateRoute, deleteRoute, addBus, getBuses, updateBus, deleteBus, addSchedule, updateSchedule, deleteSchedule, addPrivateCar, deletePrivateCar } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();
router.use(authMiddleware, adminMiddleware);

router.post('/routes', addRoute);
router.put('/routes/:id', updateRoute);
router.delete('/routes/:id', deleteRoute);

router.get('/buses', getBuses);
router.post('/buses', addBus);
router.put('/buses/:id', updateBus);
router.delete('/buses/:id', deleteBus);

router.post('/schedules', addSchedule);
router.put('/schedules/:id', updateSchedule);
router.delete('/schedules/:id', deleteSchedule);

router.post('/private-cars', addPrivateCar);      // Add a private car
router.delete('/private-cars/:id', deletePrivateCar); // Delete a private car

module.exports = router;
