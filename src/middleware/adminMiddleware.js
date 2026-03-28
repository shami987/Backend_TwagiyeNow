// Verifies the user is an admin
const pool = require('../db');

const adminMiddleware = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.id]);
    if (result.rows[0]?.role !== 'admin')
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = adminMiddleware;
