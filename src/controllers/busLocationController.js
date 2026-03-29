// Handles bus operations and GPS location
const pool = require('../db');

// GET /api/buses — list all buses
const getAllBuses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM buses ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/buses/:id — get a single bus
const getBusById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM buses WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Bus not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/buses/:id/seats — real-time seat availability across all schedules for a bus
const getBusSeats = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT s.id AS schedule_id, s.departure_time, s.price,
              r.from_city, r.to_city,
              b.capacity,
              b.capacity - COUNT(bk.id) AS available_seats
       FROM schedules s
       JOIN buses b ON s.bus_id = b.id
       JOIN routes r ON s.route_id = r.id
       LEFT JOIN bookings bk ON bk.schedule_id = s.id
       WHERE s.bus_id = $1 AND s.departure_time >= NOW()
       GROUP BY s.id, b.id, r.id
       ORDER BY s.departure_time`,
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'No upcoming schedules for this bus' });
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/buses/:id/schedule — departure and arrival schedule for a bus
const getBusSchedule = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT s.id, s.departure_time, s.price,
              r.from_city, r.to_city, r.distance_km
       FROM schedules s
       JOIN routes r ON s.route_id = r.id
       WHERE s.bus_id = $1
       ORDER BY s.departure_time`,
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'No schedule found for this bus' });
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/buses/:id/location — get current GPS location of a bus
const getBusLocation = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT bl.latitude, bl.longitude, bl.updated_at, b.name AS bus_name, b.plate
       FROM bus_locations bl
       JOIN buses b ON bl.bus_id = b.id
       WHERE bl.bus_id = $1
       ORDER BY bl.updated_at DESC LIMIT 1`,
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'No location found for this bus' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/buses/:id/location — update bus GPS location
const updateBusLocation = async (req, res) => {
  const { id } = req.params;
  const { latitude, longitude } = req.body;
  try {
    await pool.query(
      `INSERT INTO bus_locations (bus_id, latitude, longitude, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (bus_id) DO UPDATE
       SET latitude = $2, longitude = $3, updated_at = NOW()`,
      [id, latitude, longitude]
    );
    res.json({ message: 'Location updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllBuses, getBusById, getBusSeats, getBusSchedule, getBusLocation, updateBusLocation };
