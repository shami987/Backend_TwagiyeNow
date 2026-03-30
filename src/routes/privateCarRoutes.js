// Private cars endpoints
const express = require('express');
const { getPrivateCars } = require('../controllers/privateCarController');
const { addPrivateCar, deletePrivateCar } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', getPrivateCars);
router.post('/', authMiddleware, adminMiddleware, addPrivateCar);
router.delete('/:id', authMiddleware, adminMiddleware, deletePrivateCar);

module.exports = router;
