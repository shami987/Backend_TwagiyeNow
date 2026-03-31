const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [users, buses, routes, schedules, bookings, companies] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM users WHERE role = 'user'`),
      pool.query(`SELECT COUNT(*) FROM buses`),
      pool.query(`SELECT COUNT(*) FROM routes`),
      pool.query(`SELECT COUNT(*) FROM schedules WHERE DATE(departure_time) = CURRENT_DATE`),
      pool.query(`SELECT COUNT(*), COALESCE(SUM(s.price),0) AS revenue
                  FROM bookings b JOIN schedules s ON b.schedule_id = s.id
                  WHERE DATE(b.created_at) = CURRENT_DATE`),
      pool.query(`SELECT COUNT(*) FROM companies`).catch(() => ({ rows: [{ count: 0 }] })),
    ]);
    res.json({
      total_users:      parseInt(users.rows[0].count),
      total_buses:      parseInt(buses.rows[0].count),
      total_routes:     parseInt(routes.rows[0].count),
      schedules_today:  parseInt(schedules.rows[0].count),
      bookings_today:   parseInt(bookings.rows[0].count),
      revenue_today:    parseFloat(bookings.rows[0].revenue),
      total_companies:  parseInt(companies.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/stats/bookings-week
router.get('/stats/bookings-week', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DATE(b.created_at) AS date,
             COUNT(*) AS bookings,
             COALESCE(SUM(s.price), 0) AS revenue
      FROM bookings b
      JOIN schedules s ON b.schedule_id = s.id
      WHERE b.created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(b.created_at)
      ORDER BY date ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.id, b.seat_number, b.status, b.created_at,
             u.name AS user_name, u.email,
             s.departure_time, s.price,
             r.from_city, r.to_city
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN schedules s ON b.schedule_id = s.id
      JOIN routes r ON s.route_id = r.id
      ORDER BY b.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/companies
router.get('/companies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies ORDER BY applied_date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/companies
router.post('/companies', async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO companies (name, email, phone) VALUES ($1, $2, $3) RETURNING *',
      [name, email, phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/companies/:id/status
router.put('/companies/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE companies SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Company not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/companies/:id
router.delete('/companies/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM companies WHERE id = $1', [req.params.id]);
    res.json({ message: 'Company deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
