// Handles signup and login logic
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { sendOtpEmail } = require('../utils/mailer');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /api/auth/signup — register a new user and return a JWT
const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Reject if email already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ message: 'Email already in use' });

    // Hash password and insert user
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashed]
    );

    // Return user with signed token
    const token = jwt.sign({ id: result.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user: result.rows[0], token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login — verify credentials and return a JWT
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0)
      return res.status(400).json({ message: 'Invalid credentials' });

    // Compare password with stored hash
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    // Return user with signed token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/forgot-password — send OTP to email
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0)
      return res.status(404).json({ message: 'No account found with that email' });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query('DELETE FROM password_resets WHERE email = $1', [email]);
    await pool.query(
      'INSERT INTO password_resets (email, otp, expires_at) VALUES ($1, $2, $3)',
      [email, otp, expiresAt]
    );

    await sendOtpEmail(email, otp);
    res.json({ message: 'Verification code sent to your email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/verify-otp — verify the OTP code
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM password_resets WHERE email = $1 AND otp = $2 AND used = FALSE AND expires_at > NOW()',
      [email, otp]
    );
    if (result.rows.length === 0)
      return res.status(400).json({ message: 'Invalid or expired code' });

    res.json({ message: 'Code verified' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/reset-password — set new password
const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM password_resets WHERE email = $1 AND otp = $2 AND used = FALSE AND expires_at > NOW()',
      [email, otp]
    );
    if (result.rows.length === 0)
      return res.status(400).json({ message: 'Invalid or expired code' });

    const hashed = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashed, email]);
    await pool.query('UPDATE password_resets SET used = TRUE WHERE email = $1 AND otp = $2', [email, otp]);

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { signup, login, forgotPassword, verifyOtp, resetPassword };
