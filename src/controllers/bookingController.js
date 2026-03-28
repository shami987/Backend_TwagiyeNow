// Handles ticket booking operations
const pool = require('../db');

// POST /api/bookings — book one or multiple seats
const createBooking = async (req, res) => {
  const { schedule_id, seat_numbers } = req.body; // seat_numbers is an array e.g. [1, 2, 3]
  const user_id = req.user.id;

  if (!Array.isArray(seat_numbers) || seat_numbers.length === 0)
    return res.status(400).json({ message: 'seat_numbers must be a non-empty array' });

  try {
    // Check if any of the seats are already taken
    const taken = await pool.query(
      'SELECT seat_number FROM bookings WHERE schedule_id = $1 AND seat_number = ANY($2)',
      [schedule_id, seat_numbers]
    );
    if (taken.rows.length > 0) {
      const takenSeats = taken.rows.map(r => r.seat_number);
      return res.status(400).json({ message: `Seats already booked: ${takenSeats.join(', ')}` });
    }

    // Insert one booking row per seat
    const insertedBookings = [];
    for (const seat_number of seat_numbers) {
      const result = await pool.query(
        'INSERT INTO bookings (user_id, schedule_id, seat_number) VALUES ($1, $2, $3) RETURNING *',
        [user_id, schedule_id, seat_number]
      );
      insertedBookings.push(result.rows[0]);
    }

    res.status(201).json(insertedBookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/my — get all tickets for the logged-in user
const getMyBookings = async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      `SELECT bk.id, bk.seat_number, bk.status, bk.created_at,
              s.departure_time, s.price,
              r.from_city, r.to_city,
              b.name AS bus_name, b.plate
       FROM bookings bk
       JOIN schedules s ON bk.schedule_id = s.id
       JOIN routes r ON s.route_id = r.id
       JOIN buses b ON s.bus_id = b.id
       WHERE bk.user_id = $1
       ORDER BY bk.created_at DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createBooking, getMyBookings };
