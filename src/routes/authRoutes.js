// Auth routes — base path: /api/auth
const express = require('express');
const { signup, login } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup); // Register a new user
router.post('/login', login);   // Authenticate an existing user

module.exports = router;
