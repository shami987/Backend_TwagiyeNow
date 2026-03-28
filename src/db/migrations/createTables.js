// Creates routes, buses, schedules, and bookings tables
const pool = require('../index');

const createTables = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS routes (
      id          SERIAL PRIMARY KEY,
      from_city   VARCHAR(100) NOT NULL,
      to_city     VARCHAR(100) NOT NULL,
      distance_km INTEGER,
      created_at  TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS buses (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(100) NOT NULL,
      plate       VARCHAR(20) UNIQUE NOT NULL,
      capacity    INTEGER NOT NULL,
      created_at  TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id             SERIAL PRIMARY KEY,
      route_id       INTEGER REFERENCES routes(id) ON DELETE CASCADE,
      bus_id         INTEGER REFERENCES buses(id) ON DELETE CASCADE,
      departure_time TIMESTAMP NOT NULL,
      price          NUMERIC(10,2) NOT NULL,
      created_at     TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
      schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
      seat_number INTEGER NOT NULL,
      status      VARCHAR(20) DEFAULT 'confirmed',
      created_at  TIMESTAMP DEFAULT NOW(),
      UNIQUE(schedule_id, seat_number)
    );
  `;

  try {
    await pool.query(query);
    console.log('✅ All tables created successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
};

createTables();
