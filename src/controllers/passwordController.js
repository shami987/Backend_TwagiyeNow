// Handles forgot password flow: request OTP → verify OTP → reset password
const bcrypt = require('bcryptjs');
const pool = require('../db');
const sendOtpEmail = require('../utils/mailer');

// POST /api/auth/forgot-password — generate OTP and send to email
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // Check if user exists
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'No account found with this email' });

    // Generate 6-digit OTP and set 10-min expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to database
    await pool.query('UPDATE users SET otp = $1, otp_expires = $2 WHERE email = $3', [otp, expires, email]);

    // Send OTP via email
    await sendOtpEmail(email, otp);

    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/verify-otp — verify the OTP is correct and not expired
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const result = await pool.query('SELECT otp, otp_expires FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'User not found' });

    const { otp: savedOtp, otp_expires } = result.rows[0];

    // Check OTP match and expiry
    if (savedOtp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > new Date(otp_expires)) return res.status(400).json({ message: 'OTP has expired' });

    res.json({ message: 'OTP verified' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/reset-password — set new password after OTP verified
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const result = await pool.query('SELECT otp, otp_expires FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'User not found' });

    const { otp: savedOtp, otp_expires } = result.rows[0];

    // Re-validate OTP before resetting
    if (savedOtp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > new Date(otp_expires)) return res.status(400).json({ message: 'OTP has expired' });

    // Hash new password and clear OTP
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password = $1, otp = NULL, otp_expires = NULL WHERE email = $2',
      [hashed, email]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { forgotPassword, verifyOtp, resetPassword };
