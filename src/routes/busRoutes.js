const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET /api/buses — public bus listings
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM buses ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/buses/:id — single bus detail
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM buses WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Bus not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
