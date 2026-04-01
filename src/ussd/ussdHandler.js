// Handles USSD session logic
const pool = require('../db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// In-memory session store
const sessions = {};
module.exports.sessions = sessions;

const getSession = (sessionId) => sessions[sessionId] || { step: 'main', data: {} };
const setSession = (sessionId, session) => { sessions[sessionId] = session; };
const clearSession = (sessionId) => { delete sessions[sessionId]; };

const processUSSD = async (sessionId, input) => {
  const session = getSession(sessionId);
  const { step, data } = session;
  let response = '';
  let newStep = step;
  let newData = { ...data };

  if (step === 'main') {
    if (input === '' || input === null) {
      response = `CON Welcome to TwagiyeNow 🚌\n\n1. Book Bus Ticket\n2. My Bookings\n3. Cancel Booking\n4. Exit`;
    } else if (input === '1') {
      newStep = 'book_route';
      response = `CON Select Route:\n\n1. Kigali → Musanze\n2. Kigali → Huye\n3. Kigali → Rubavu\n4. Kigali → Nyagatare\n5. Kigali → Rusizi\n\n0. Back`;
    } else if (input === '2') {
      newStep = 'my_bookings_phone';
      response = `CON Enter your phone number\nto view bookings:`;
    } else if (input === '3') {
      newStep = 'cancel_phone';
      response = `CON Enter your phone number\nto cancel a booking:`;
    } else if (input === '4') {
      clearSession(sessionId);
      response = `END Thank you for using TwagiyeNow!\nSafe travels. 🚌`;
    } else {
      response = `CON Invalid option.\n\n1. Book Bus Ticket\n2. My Bookings\n3. Cancel Booking\n4. Exit`;
    }

  } else if (step === 'book_route') {
    const routes = {
      '1': { from: 'Kigali', to: 'Musanze' },
      '2': { from: 'Kigali', to: 'Huye' },
      '3': { from: 'Kigali', to: 'Rubavu' },
      '4': { from: 'Kigali', to: 'Nyagatare' },
      '5': { from: 'Kigali', to: 'Rusizi' },
    };
    if (input === '0') {
      newStep = 'main';
      response = `CON Welcome to TwagiyeNow 🚌\n\n1. Book Bus Ticket\n2. My Bookings\n3. Cancel Booking\n4. Exit`;
    } else if (routes[input]) {
      newData.route = routes[input];
      newStep = 'book_date';
      response = `CON Route: ${routes[input].from} → ${routes[input].to}\n\nEnter travel date:\nFormat: YYYY-MM-DD\nExample: 2026-03-31\n\n0. Back`;
    } else {
      response = `CON Invalid. Select 1-5:\n\n1. Kigali → Musanze\n2. Kigali → Huye\n3. Kigali → Rubavu\n4. Kigali → Nyagatare\n5. Kigali → Rusizi\n\n0. Back`;
    }

  } else if (step === 'book_date') {
    if (input === '0') {
      newStep = 'book_route';
      response = `CON Select Route:\n\n1. Kigali → Musanze\n2. Kigali → Huye\n3. Kigali → Rubavu\n4. Kigali → Nyagatare\n5. Kigali → Rusizi\n\n0. Back`;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      response = `CON Invalid format.\nUse YYYY-MM-DD\nExample: 2026-03-31\n\n0. Back`;
    } else if (input < new Date().toISOString().split('T')[0]) {
      response = `CON Cannot book past dates.\nEnter a future date:\n\n0. Back`;
    } else {
      const { from, to } = newData.route;
      const result = await pool.query(
        `SELECT s.id, s.departure_time, s.price,
                b.capacity - COUNT(bk.id) AS available_seats
         FROM schedules s
         JOIN routes r ON s.route_id = r.id
         JOIN buses b ON s.bus_id = b.id
         LEFT JOIN bookings bk ON bk.schedule_id = s.id
         WHERE r.from_city ILIKE $1 AND r.to_city ILIKE $2
           AND DATE(s.departure_time) = $3
           AND s.departure_time > NOW()
         GROUP BY s.id, b.id
         HAVING b.capacity - COUNT(bk.id) > 0
         ORDER BY s.departure_time`,
        [from, to, input]
      );
      if (result.rows.length === 0) {
        response = `CON No buses found for\n${from}→${to} on ${input}.\n\nTry another date:\n\n0. Back to menu`;
      } else {
        newData.date = input;
        newData.schedules = result.rows;
        newStep = 'book_select';
        const list = result.rows.map((s, i) =>
          `${i + 1}. ${new Date(s.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | ${Number(s.price).toLocaleString()} RWF | ${s.available_seats} seats`
        ).join('\n');
        response = `CON Buses on ${input}:\n\n${list}\n\nSelect bus number:\n0. Back`;
      }
    }

  } else if (step === 'book_select') {
    if (input === '0') {
      newStep = 'book_date';
      response = `CON Enter travel date:\nFormat: YYYY-MM-DD\n\n0. Back`;
    } else {
      const idx = parseInt(input) - 1;
      if (isNaN(idx) || idx < 0 || idx >= newData.schedules.length) {
        const list = newData.schedules.map((s, i) =>
          `${i + 1}. ${new Date(s.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | ${Number(s.price).toLocaleString()} RWF`
        ).join('\n');
        response = `CON Invalid selection.\n\n${list}\n\nSelect bus number:\n0. Back`;
      } else {
        newData.selected = newData.schedules[idx];
        newStep = 'book_phone';
        response = `CON Bus selected!\nTime: ${new Date(newData.selected.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\nPrice: ${Number(newData.selected.price).toLocaleString()} RWF\n\nEnter your phone number:`;
      }
    }

  } else if (step === 'book_phone') {
    if (!/^07\d{8}$/.test(input)) {
      response = `CON Invalid phone number.\nFormat: 07XXXXXXXX\nExample: 0781234567`;
    } else {
      // Find user by checking if phone matches any user (simplified)
      const userResult = await pool.query('SELECT id, name FROM users WHERE role = $1 LIMIT 1', ['user']);
      if (userResult.rows.length === 0) {
        response = `CON No account found.\nPlease register in the app first.\n\n0. Back to menu`;
      } else {
        newData.phone = input;
        newData.user = userResult.rows[0];
        newStep = 'book_payment';
        response = `CON Confirm Booking:\n${newData.route.from} → ${newData.route.to}\nDate: ${newData.date}\nTime: ${new Date(newData.selected.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\nPrice: ${Number(newData.selected.price).toLocaleString()} RWF\nPhone: ${input}\n\nPay with:\n1. MTN MoMo\n2. Airtel Money\n0. Cancel`;
      }
    }

  } else if (step === 'book_payment') {
    if (input === '0') {
      clearSession(sessionId);
      response = `END Booking cancelled.\nDial *384# to start again.`;
    } else if (input === '1' || input === '2') {
      const method = input === '1' ? 'momo' : 'airtel';
      // Find available seat
      const seatsResult = await pool.query(
        `SELECT generate_series(1, b.capacity) AS seat_number
         FROM schedules s JOIN buses b ON s.bus_id = b.id
         WHERE s.id = $1
         EXCEPT
         SELECT seat_number FROM bookings WHERE schedule_id = $1
         ORDER BY seat_number LIMIT 1`,
        [newData.selected.id]
      );
      if (seatsResult.rows.length === 0) {
        clearSession(sessionId);
        response = `END No seats available.\nTry another schedule.\nDial *384# to start again.`;
      } else {
        const seatNumber = seatsResult.rows[0].seat_number;
        const qrCode = crypto.createHash('sha256').update(`${newData.selected.id}-${newData.user.id}-${Date.now()}`).digest('hex');
        // Create booking
        await pool.query(
          `INSERT INTO bookings (user_id, schedule_id, seat_number, status, payment_status, payment_method, qr_code)
           VALUES ($1, $2, $3, 'confirmed', 'paid', $4, $5)`,
          [newData.user.id, newData.selected.id, seatNumber, method, qrCode]
        );
        clearSession(sessionId);
        response = `END ✅ Booking Confirmed!\n\n${newData.route.from} → ${newData.route.to}\nDate: ${newData.date}\nSeat: ${seatNumber}\nPayment: ${method === 'momo' ? 'MTN MoMo' : 'Airtel Money'}\nAmount: ${Number(newData.selected.price).toLocaleString()} RWF\nPhone: ${newData.phone}\n\nSafe travels! 🚌\nRef: ${qrCode.substring(0, 8).toUpperCase()}`;
      }
    } else {
      response = `CON Invalid.\n1. MTN MoMo\n2. Airtel Money\n0. Cancel`;
    }

  } else if (step === 'my_bookings_phone') {
    if (!/^07\d{8}$/.test(input)) {
      response = `CON Invalid phone number.\nFormat: 07XXXXXXXX`;
    } else {
      const result = await pool.query(
        `SELECT bk.seat_number, bk.status, r.from_city, r.to_city, s.departure_time
         FROM bookings bk
         JOIN schedules s ON bk.schedule_id = s.id
         JOIN routes r ON s.route_id = r.id
         JOIN users u ON bk.user_id = u.id
         ORDER BY bk.created_at DESC LIMIT 5`
      );
      if (result.rows.length === 0) {
        response = `END No bookings found for ${input}.`;
      } else {
        const list = result.rows.map((b, i) =>
          `${i + 1}. ${b.from_city}→${b.to_city} Seat:${b.seat_number} [${b.status}]`
        ).join('\n');
        response = `END Your Bookings:\n\n${list}`;
      }
      clearSession(sessionId);
    }

  } else {
    clearSession(sessionId);
    response = `END Session expired.\nDial *384# to start again.`;
  }

  setSession(sessionId, { step: newStep, data: newData });
  return response;
};

module.exports = { processUSSD };
