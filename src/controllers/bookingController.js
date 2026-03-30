// Handles ticket booking operations
const pool = require('../db');
const crypto = require('crypto');

// POST /api/bookings — book one or multiple seats
const createBooking = async (req, res) => {
  const { schedule_id, seat_numbers } = req.body;
  const user_id = req.user.id;

  if (!Array.isArray(seat_numbers) || seat_numbers.length === 0)
    return res.status(400).json({ message: 'seat_numbers must be a non-empty array' });

  try {
    // Check if any seats are already taken
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

// POST /api/bookings/:id/pay — confirm payment and generate QR code
const payBooking = async (req, res) => {
  const { id } = req.params;
  const { payment_method } = req.body; // 'momo' or 'airtel'
  const user_id = req.user.id;

  try {
    // Verify booking belongs to user
    const booking = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    if (booking.rows.length === 0)
      return res.status(404).json({ message: 'Booking not found' });

    if (booking.rows[0].payment_status === 'paid')
      return res.status(400).json({ message: 'Booking already paid' });

    // Generate QR code data (unique hash for this booking)
    const qr_code = crypto.createHash('sha256').update(`${id}-${user_id}-${Date.now()}`).digest('hex');

    // Update booking as paid with QR code
    const result = await pool.query(
      `UPDATE bookings
       SET payment_status = 'paid', payment_method = $1, qr_code = $2, status = 'confirmed'
       WHERE id = $3 RETURNING *`,
      [payment_method, qr_code, id]
    );

    res.json({ ...result.rows[0], qr_code });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/:id — get booking details and QR code
const getBookingById = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      `SELECT bk.id, bk.seat_number, bk.status, bk.payment_status,
              bk.payment_method, bk.qr_code, bk.created_at,
              s.departure_time, s.price,
              r.from_city, r.to_city,
              b.name AS bus_name, b.plate
       FROM bookings bk
       JOIN schedules s ON bk.schedule_id = s.id
       JOIN routes r ON s.route_id = r.id
       JOIN buses b ON s.bus_id = b.id
       WHERE bk.id = $1 AND bk.user_id = $2`,
      [id, user_id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Booking not found' });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/my — get all tickets for the logged-in user
const getMyBookings = async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      `SELECT bk.id, bk.seat_number, bk.status, bk.payment_status,
              bk.payment_method, bk.qr_code, bk.created_at,
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

// PUT /api/bookings/:id/cancel — cancel a booking
const cancelBooking = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const booking = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    if (booking.rows.length === 0)
      return res.status(404).json({ message: 'Booking not found' });

    if (booking.rows[0].status === 'cancelled')
      return res.status(400).json({ message: 'Booking already cancelled' });

    const result = await pool.query(
      `UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createBooking, payBooking, getBookingById, getMyBookings, cancelBooking };
