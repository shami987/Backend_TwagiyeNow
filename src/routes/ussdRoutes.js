const express = require('express');
const pool = require('../db');
const bcrypt = require('bcryptjs');
const router = express.Router();

// In-memory session store (use Redis in production)
const sessions = {};

const getSession = (sessionId) => sessions[sessionId] || { step: 'main', data: {} };
const setSession = (sessionId, session) => { sessions[sessionId] = session; };
const clearSession = (sessionId) => { delete sessions[sessionId]; };

const END = (text) => `END ${text}`;
const CON = (text) => `CON ${text}`;

// POST /api/ussd
router.post('/', express.urlencoded({ extended: false }), async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  const input = text ? text.split('*').pop() : '';
  const fullText = text || '';
  const parts = fullText.split('*');

  let response = '';

  try {
    const session = getSession(sessionId);

    // ── MAIN MENU ──────────────────────────────────────────
    if (!fullText) {
      setSession(sessionId, { step: 'main', data: {} });
      response = CON(
        'Welcome to TwagiyeNow\n' +
        '1. Book a Bus\n' +
        '2. Book a Private Car\n' +
        '3. My Bookings\n' +
        '0. Exit'
      );

    // ── BUS BOOKING ────────────────────────────────────────
    } else if (parts[0] === '1') {

      if (parts.length === 1) {
        // Step 1: Enter FROM city
        response = CON('Enter departure city:\n(e.g. Kigali)');

      } else if (parts.length === 2) {
        // Step 2: Enter TO city
        response = CON('Enter destination city:\n(e.g. Musanze)');

      } else if (parts.length === 3) {
        // Step 3: Enter date
        response = CON('Enter travel date:\n(e.g. 2026-04-10)');

      } else if (parts.length === 4) {
        // Step 4: Show available schedules
        const from = parts[1];
        const to = parts[2];
        const date = parts[3];

        const result = await pool.query(
          `SELECT s.id, s.departure_time, s.price,
                  b.name AS bus_name,
                  b.capacity - COUNT(bk.id) AS available_seats
           FROM schedules s
           JOIN routes r ON s.route_id = r.id
           JOIN buses b ON s.bus_id = b.id
           LEFT JOIN bookings bk ON bk.schedule_id = s.id
           WHERE r.from_city ILIKE $1 AND r.to_city ILIKE $2
             AND DATE(s.departure_time) = $3
           GROUP BY s.id, b.id
           HAVING b.capacity - COUNT(bk.id) > 0
           ORDER BY s.departure_time
           LIMIT 5`,
          [from, to, date]
        );

        if (result.rows.length === 0) {
          response = END(`No buses found for ${from} → ${to} on ${date}.`);
        } else {
          setSession(sessionId, { step: 'bus_select', data: { schedules: result.rows, from, to, date } });
          let menu = `Buses ${from} → ${to} on ${date}:\n`;
          result.rows.forEach((s, i) => {
            const time = new Date(s.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            menu += `${i + 1}. ${s.bus_name} ${time} - ${Number(s.price).toLocaleString()} RWF\n`;
          });
          menu += '0. Back';
          response = CON(menu);
        }

      } else if (parts.length === 5) {
        // Step 5: Select seat number
        const scheduleIdx = parseInt(parts[4]) - 1;
        const sess = getSession(sessionId);
        const schedule = sess.data.schedules?.[scheduleIdx];

        if (!schedule) {
          response = END('Invalid selection. Please try again.');
        } else {
          setSession(sessionId, { ...sess, data: { ...sess.data, selectedSchedule: schedule } });
          response = CON(
            `${schedule.bus_name}\n` +
            `Price: ${Number(schedule.price).toLocaleString()} RWF\n` +
            `Seats available: ${schedule.available_seats}\n\n` +
            'Enter seat number:'
          );
        }

      } else if (parts.length === 6) {
        // Step 6: Confirm booking
        const seatNumber = parseInt(parts[5]);
        const sess = getSession(sessionId);
        const schedule = sess.data.selectedSchedule;

        if (!schedule || isNaN(seatNumber)) {
          response = END('Invalid input. Please try again.');
        } else {
          setSession(sessionId, { ...sess, data: { ...sess.data, seatNumber } });
          const time = new Date(schedule.departure_time).toLocaleString();
          response = CON(
            `Confirm Booking:\n` +
            `Bus: ${schedule.bus_name}\n` +
            `Seat: ${seatNumber}\n` +
            `Price: ${Number(schedule.price).toLocaleString()} RWF\n` +
            `Departure: ${time}\n\n` +
            '1. Confirm\n' +
            '2. Cancel'
          );
        }

      } else if (parts.length === 7) {
        // Step 7: Process booking
        const confirm = parts[6];
        const sess = getSession(sessionId);

        if (confirm === '1') {
          const { selectedSchedule, seatNumber } = sess.data;

          // Find or create user by phone
          let user = await pool.query('SELECT id FROM users WHERE email = $1', [`${phoneNumber}@ussd.twagiyenow.com`]);
          if (user.rows.length === 0) {
            const hashed = await bcrypt.hash(phoneNumber, 10);
            user = await pool.query(
              'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
              [`USSD User ${phoneNumber}`, `${phoneNumber}@ussd.twagiyenow.com`, hashed]
            );
          }
          const userId = user.rows[0].id;

          // Check seat not taken
          const taken = await pool.query(
            'SELECT id FROM bookings WHERE schedule_id = $1 AND seat_number = $2',
            [selectedSchedule.id, seatNumber]
          );

          if (taken.rows.length > 0) {
            response = END(`Seat ${seatNumber} is already taken. Please try again with a different seat.`);
          } else {
            await pool.query(
              'INSERT INTO bookings (user_id, schedule_id, seat_number, status) VALUES ($1, $2, $3, $4)',
              [userId, selectedSchedule.id, seatNumber, 'confirmed']
            );
            clearSession(sessionId);
            response = END(
              `Booking Confirmed!\n` +
              `Bus: ${selectedSchedule.bus_name}\n` +
              `Seat: ${seatNumber}\n` +
              `Price: ${Number(selectedSchedule.price).toLocaleString()} RWF\n` +
              `Thank you for using TwagiyeNow!`
            );
          }
        } else {
          clearSession(sessionId);
          response = END('Booking cancelled.');
        }
      }

    // ── PRIVATE CAR BOOKING ────────────────────────────────
    } else if (parts[0] === '2') {

      if (parts.length === 1) {
        response = CON('Enter pickup location:');

      } else if (parts.length === 2) {
        response = CON('Enter dropoff location:');

      } else if (parts.length === 3) {
        response = CON('Enter distance in km:\n(e.g. 25)');

      } else if (parts.length === 4) {
        // Show available cars
        const result = await pool.query(
          'SELECT id, driver_name, car_model, plate, capacity, price_per_km FROM private_cars WHERE available = TRUE ORDER BY price_per_km LIMIT 5'
        );

        if (result.rows.length === 0) {
          response = END('No cars available at the moment. Please try again later.');
        } else {
          const distanceKm = parseFloat(parts[3]);
          setSession(sessionId, {
            step: 'car_select',
            data: { cars: result.rows, pickup: parts[1], dropoff: parts[2], distanceKm }
          });
          let menu = 'Available Cars:\n';
          result.rows.forEach((c, i) => {
            const total = (c.price_per_km * distanceKm).toLocaleString();
            menu += `${i + 1}. ${c.car_model} - ${total} RWF\n`;
          });
          menu += '0. Back';
          response = CON(menu);
        }

      } else if (parts.length === 5) {
        // Confirm car selection
        const carIdx = parseInt(parts[4]) - 1;
        const sess = getSession(sessionId);
        const car = sess.data.cars?.[carIdx];

        if (!car) {
          response = END('Invalid selection.');
        } else {
          const total = (car.price_per_km * sess.data.distanceKm).toLocaleString();
          setSession(sessionId, { ...sess, data: { ...sess.data, selectedCar: car } });
          response = CON(
            `Confirm Car Booking:\n` +
            `Car: ${car.car_model}\n` +
            `Driver: ${car.driver_name}\n` +
            `Pickup: ${sess.data.pickup}\n` +
            `Dropoff: ${sess.data.dropoff}\n` +
            `Total: ${total} RWF\n\n` +
            '1. Confirm\n' +
            '2. Cancel'
          );
        }

      } else if (parts.length === 6) {
        const confirm = parts[5];
        const sess = getSession(sessionId);

        if (confirm === '1') {
          const { selectedCar, pickup, dropoff, distanceKm } = sess.data;
          const totalPrice = selectedCar.price_per_km * distanceKm;
          const pickupTime = new Date(Date.now() + 30 * 60 * 1000); // 30 min from now

          let user = await pool.query('SELECT id FROM users WHERE email = $1', [`${phoneNumber}@ussd.twagiyenow.com`]);
          if (user.rows.length === 0) {
            const hashed = await bcrypt.hash(phoneNumber, 10);
            user = await pool.query(
              'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
              [`USSD User ${phoneNumber}`, `${phoneNumber}@ussd.twagiyenow.com`, hashed]
            );
          }
          const userId = user.rows[0].id;

          await pool.query(
            `INSERT INTO private_car_bookings (user_id, car_id, pickup_location, dropoff_location, pickup_time, distance_km, total_price, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed')`,
            [userId, selectedCar.id, pickup, dropoff, pickupTime, distanceKm, totalPrice]
          );
          await pool.query('UPDATE private_cars SET available = FALSE WHERE id = $1', [selectedCar.id]);

          clearSession(sessionId);
          response = END(
            `Car Booked!\n` +
            `${selectedCar.car_model}\n` +
            `Driver: ${selectedCar.driver_name}\n` +
            `Pickup: ${pickup}\n` +
            `Total: ${totalPrice.toLocaleString()} RWF\n` +
            `Driver arrives in ~30 min.\n` +
            `Thank you for using TwagiyeNow!`
          );
        } else {
          clearSession(sessionId);
          response = END('Booking cancelled.');
        }
      }

    // ── MY BOOKINGS ────────────────────────────────────────
    } else if (parts[0] === '3') {
      const user = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [`${phoneNumber}@ussd.twagiyenow.com`]
      );

      if (user.rows.length === 0) {
        response = END('No bookings found for this number.');
      } else {
        const userId = user.rows[0].id;
        const bookings = await pool.query(
          `SELECT r.from_city, r.to_city, s.departure_time, bk.seat_number, bk.status
           FROM bookings bk
           JOIN schedules s ON bk.schedule_id = s.id
           JOIN routes r ON s.route_id = r.id
           WHERE bk.user_id = $1
           ORDER BY bk.created_at DESC LIMIT 3`,
          [userId]
        );

        if (bookings.rows.length === 0) {
          response = END('No bookings found.');
        } else {
          let msg = 'Your recent bookings:\n';
          bookings.rows.forEach((b, i) => {
            const date = new Date(b.departure_time).toLocaleDateString();
            msg += `${i + 1}. ${b.from_city}→${b.to_city} ${date} Seat:${b.seat_number} [${b.status}]\n`;
          });
          response = END(msg);
        }
      }

    // ── EXIT ───────────────────────────────────────────────
    } else if (parts[0] === '0') {
      clearSession(sessionId);
      response = END('Thank you for using TwagiyeNow. Goodbye!');

    } else {
      response = END('Invalid option. Please try again.');
    }

  } catch (err) {
    console.error('USSD error:', err.message);
    response = END('Service error. Please try again later.');
  }

  res.set('Content-Type', 'text/plain');
  res.send(response);
});

module.exports = router;
