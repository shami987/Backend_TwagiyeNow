// Handles private car operations
const pool = require('../db');

// GET /api/private-cars — list all available private cars
const getPrivateCars = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM private_cars WHERE available = TRUE ORDER BY price_per_km'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getPrivateCars };
