// Handles schedule search
const pool = require('../db');

// GET /api/schedules?from=&to=&date= — search available buses
const getSchedules = async (req, res) => {
  const { from, to, date } = req.query;
  try {
    const result = await pool.query(
      `SELECT s.id, s.departure_time, s.price,
              r.from_city, r.to_city, r.distance_km,
              b.name AS bus_name, b.plate, b.capacity,
              -- Count booked seats to calculate availability
              b.capacity - COUNT(bk.id) AS available_seats
       FROM schedules s
       JOIN routes r ON s.route_id = r.id
       JOIN buses b ON s.bus_id = b.id
       LEFT JOIN bookings bk ON bk.schedule_id = s.id
       WHERE r.from_city ILIKE $1
         AND r.to_city ILIKE $2
         AND DATE(s.departure_time) = $3
       GROUP BY s.id, r.id, b.id
       HAVING b.capacity - COUNT(bk.id) > 0
       ORDER BY s.departure_time`,
      [from, to, date]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSchedules };
