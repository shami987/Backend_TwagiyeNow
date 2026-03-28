// Handles bus route operations
const pool = require('../db');

// GET /api/routes — list all routes
const getRoutes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM routes ORDER BY from_city');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getRoutes };
