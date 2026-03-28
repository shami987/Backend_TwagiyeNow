// Admin controller — manage routes, buses, and schedules
const pool = require('../db');

// POST /api/admin/routes — add a new route
const addRoute = async (req, res) => {
  const { from_city, to_city, distance_km } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO routes (from_city, to_city, distance_km) VALUES ($1, $2, $3) RETURNING *',
      [from_city, to_city, distance_km]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/buses — add a new bus
const addBus = async (req, res) => {
  const { name, plate, capacity } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO buses (name, plate, capacity) VALUES ($1, $2, $3) RETURNING *',
      [name, plate, capacity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/schedules — add a new schedule
const addSchedule = async (req, res) => {
  const { route_id, bus_id, departure_time, price } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO schedules (route_id, bus_id, departure_time, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [route_id, bus_id, departure_time, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/buses — list all buses
const getBuses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM buses ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addRoute, addBus, addSchedule, getBuses };
