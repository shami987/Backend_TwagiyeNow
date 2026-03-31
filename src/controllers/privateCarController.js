// Handles private car operations and bookings
const pool = require('../db');
const crypto = require('crypto');

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

// POST /api/private-cars/book — book a private car
const bookPrivateCar = async (req, res) => {
  const { car_id, pickup_location, dropoff_location, pickup_time, distance_km } = req.body;
  const user_id = req.user.id;
  try {
    // Check car is available
    const car = await pool.query('SELECT * FROM private_cars WHERE id = $1 AND available = TRUE', [car_id]);
    if (car.rows.length === 0)
      return res.status(404).json({ message: 'Car not available' });

    // Calculate total price
    const total_price = distance_km * Number(car.rows[0].price_per_km);

    // Create booking
    const result = await pool.query(
      `INSERT INTO private_car_bookings
        (user_id, car_id, pickup_location, dropoff_location, pickup_time, distance_km, total_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [user_id, car_id, pickup_location, dropoff_location, pickup_time, distance_km, total_price]
    );

    // Mark car as unavailable
    await pool.query('UPDATE private_cars SET available = FALSE WHERE id = $1', [car_id]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/private-cars/book/:id/pay — pay for a private car booking
const payPrivateCarBooking = async (req, res) => {
  const { id } = req.params;
  const { payment_method } = req.body;
  const user_id = req.user.id;
  try {
    // Verify booking belongs to user
    const booking = await pool.query(
      'SELECT * FROM private_car_bookings WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    if (booking.rows.length === 0)
      return res.status(404).json({ message: 'Booking not found' });

    if (booking.rows[0].payment_status === 'paid')
      return res.status(400).json({ message: 'Already paid' });

    // Generate QR code
    const qr_code = crypto.createHash('sha256').update(`${id}-${user_id}-${Date.now()}`).digest('hex');

    const result = await pool.query(
      `UPDATE private_car_bookings
       SET payment_method = $1, payment_status = 'paid', qr_code = $2, status = 'confirmed'
       WHERE id = $3 RETURNING *`,
      [payment_method, qr_code, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/private-cars/my-bookings — get user's private car bookings
const getMyCarBookings = async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      `SELECT pcb.*, pc.driver_name, pc.car_model, pc.plate, pc.price_per_km
       FROM private_car_bookings pcb
       JOIN private_cars pc ON pcb.car_id = pc.id
       WHERE pcb.user_id = $1
       ORDER BY pcb.created_at DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/private-cars/book/:id/cancel — cancel a private car booking
const cancelCarBooking = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  try {
    const booking = await pool.query(
      'SELECT * FROM private_car_bookings WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    if (booking.rows.length === 0)
      return res.status(404).json({ message: 'Booking not found' });

    if (booking.rows[0].status === 'cancelled')
      return res.status(400).json({ message: 'Already cancelled' });

    // Cancel booking and make car available again
    await pool.query(
      `UPDATE private_car_bookings SET status = 'cancelled' WHERE id = $1`, [id]
    );
    await pool.query(
      'UPDATE private_cars SET available = TRUE WHERE id = $1', [booking.rows[0].car_id]
    );

    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getPrivateCars, bookPrivateCar, payPrivateCarBooking, getMyCarBookings, cancelCarBooking };
