const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// GET /api/drivers
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, b.name AS bus_name, b.plate
      FROM drivers d
      LEFT JOIN buses b ON d.assigned_bus_id = b.id
      ORDER BY d.name
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/drivers
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, license, phone, status, assigned_bus_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO drivers (name, license, phone, status, assigned_bus_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, license, phone, status || 'off-duty', assigned_bus_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/drivers/:id
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, license, phone, status, assigned_bus_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE drivers SET name=$1, license=$2, phone=$3, status=$4, assigned_bus_id=$5 WHERE id=$6 RETURNING *',
      [name, license, phone, status, assigned_bus_id || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Driver not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/drivers/:id
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM drivers WHERE id=$1', [req.params.id]);
    res.json({ message: 'Driver deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
