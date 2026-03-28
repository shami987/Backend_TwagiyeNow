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

// GET /api/routes/:id — single route detail
const getRouteById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM routes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Route not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getRoutes, getRouteById };
