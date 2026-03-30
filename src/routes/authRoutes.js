// Auth routes — base path: /api/auth
const express = require('express');
const { signup, login } = require('../controllers/authController');
const { forgotPassword, verifyOtp, resetPassword } = require('../controllers/passwordController');

const router = express.Router();

router.post('/signup', signup);                   // Register a new user
router.post('/login', login);                     // Authenticate an existing user
router.post('/forgot-password', forgotPassword);  // Send OTP to email
router.post('/verify-otp', verifyOtp);            // Verify OTP
router.post('/reset-password', resetPassword);    // Set new password

module.exports = router;
