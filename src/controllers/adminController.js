// Admin controller — manage routes, buses, and schedules
const pool = require('../db');

const addRoute = async (req, res) => {
  const { from_city, to_city, distance_km } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO routes (from_city, to_city, distance_km) VALUES ($1, $2, $3) RETURNING *',
      [from_city, to_city, distance_km]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateRoute = async (req, res) => {
  const { from_city, to_city, distance_km } = req.body;
  try {
    const result = await pool.query(
      'UPDATE routes SET from_city=$1, to_city=$2, distance_km=$3 WHERE id=$4 RETURNING *',
      [from_city, to_city, distance_km, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Route not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteRoute = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM routes WHERE id=$1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Route not found' });
    res.json({ message: 'Route deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const addBus = async (req, res) => {
  const { name, plate, capacity } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO buses (name, plate, capacity) VALUES ($1, $2, $3) RETURNING *',
      [name, plate, capacity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getBuses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM buses ORDER BY name');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateBus = async (req, res) => {
  const { name, plate, capacity } = req.body;
  try {
    const result = await pool.query(
      'UPDATE buses SET name=$1, plate=$2, capacity=$3 WHERE id=$4 RETURNING *',
      [name, plate, capacity, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Bus not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteBus = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM buses WHERE id=$1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Bus not found' });
    res.json({ message: 'Bus deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const addSchedule = async (req, res) => {
  const { route_id, bus_id, departure_time, price } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO schedules (route_id, bus_id, departure_time, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [route_id, bus_id, departure_time, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateSchedule = async (req, res) => {
  const { route_id, bus_id, departure_time, price } = req.body;
  try {
    const result = await pool.query(
      'UPDATE schedules SET route_id=$1, bus_id=$2, departure_time=$3, price=$4 WHERE id=$5 RETURNING *',
      [route_id, bus_id, departure_time, price, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Schedule not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteSchedule = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM schedules WHERE id=$1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Schedule not found' });
    res.json({ message: 'Schedule deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { addRoute, updateRoute, deleteRoute, addBus, getBuses, updateBus, deleteBus, addSchedule, updateSchedule, deleteSchedule };
