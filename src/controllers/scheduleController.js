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

// GET /api/schedules/:id/seats — seat map for a schedule
const getScheduleSeats = async (req, res) => {
  const { id } = req.params;
  try {
    const schedule = await pool.query(
      `SELECT s.id, b.capacity FROM schedules s JOIN buses b ON s.bus_id = b.id WHERE s.id = $1`,
      [id]
    );
    if (schedule.rows.length === 0) return res.status(404).json({ message: 'Schedule not found' });

    const { capacity } = schedule.rows[0];
    const booked = await pool.query(
      'SELECT seat_number FROM bookings WHERE schedule_id = $1',
      [id]
    );
    const bookedSeats = booked.rows.map(r => r.seat_number);
    const seats = Array.from({ length: capacity }, (_, i) => ({
      seat_number: i + 1,
      status: bookedSeats.includes(i + 1) ? 'booked' : 'available',
    }));

    res.json({ schedule_id: Number(id), capacity, seats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSchedules, getScheduleSeats };
