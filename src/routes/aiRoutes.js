const express = require('express');
const router = express.Router();
const { chat, voiceChat, searchTrips } = require('../controllers/aiController');

router.post('/chat', chat);
router.post('/voice', voiceChat);
router.get('/search-trips', searchTrips);

module.exports = router;
