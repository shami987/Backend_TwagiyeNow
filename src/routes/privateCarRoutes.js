// Private cars endpoints
const express = require('express');
const { getPrivateCars } = require('../controllers/privateCarController');

const router = express.Router();

router.get('/', getPrivateCars); // List available private cars

module.exports = router;
