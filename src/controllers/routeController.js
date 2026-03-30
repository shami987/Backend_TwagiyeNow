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

// GET /api/routes/search?from=&to=&date= — search routes by origin, destination, date
const searchRoutes = async (req, res) => {
  const { from, to, date } = req.query;
  try {
    const result = await pool.query(
      `SELECT s.id AS schedule_id, s.departure_time, s.price,
              r.id AS route_id, r.from_city, r.to_city, r.distance_km,
              b.id AS bus_id, b.name AS bus_name, b.plate, b.capacity,
              b.capacity - COUNT(bk.id) AS available_seats
       FROM schedules s
       JOIN routes r ON s.route_id = r.id
       JOIN buses b ON s.bus_id = b.id
       LEFT JOIN bookings bk ON bk.schedule_id = s.id
       WHERE r.from_city ILIKE $1
         AND r.to_city ILIKE $2
         AND DATE(s.departure_time) = $3
       GROUP BY s.id, r.id, b.id
       ORDER BY s.departure_time`,
      [from, to, date]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/routes/:id/buses — list all buses for a specific route
const getBusesByRoute = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT b.id, b.name, b.plate, b.capacity
       FROM buses b
       JOIN schedules s ON s.bus_id = b.id
       WHERE s.route_id = $1
       ORDER BY b.name`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getRoutes, getRouteById, searchRoutes, getBusesByRoute };
