const pool = require('../index');

const createTables = async () => {
  const query = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS routes (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      from_city   VARCHAR(100) NOT NULL,
      to_city     VARCHAR(100) NOT NULL,
      distance_km INTEGER,
      created_at  TIMESTAMP   DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS buses (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(100) NOT NULL,
      plate       VARCHAR(20)  UNIQUE NOT NULL,
      capacity    INTEGER      NOT NULL,
      created_at  TIMESTAMP    DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      route_id       UUID        REFERENCES routes(id) ON DELETE CASCADE,
      bus_id         UUID        REFERENCES buses(id) ON DELETE CASCADE,
      departure_time TIMESTAMP   NOT NULL,
      price          NUMERIC(10,2) NOT NULL,
      created_at     TIMESTAMP   DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID        REFERENCES users(id) ON DELETE CASCADE,
      schedule_id UUID        REFERENCES schedules(id) ON DELETE CASCADE,
      seat_number INTEGER     NOT NULL,
      status      VARCHAR(20) DEFAULT 'confirmed',
      created_at  TIMESTAMP   DEFAULT NOW(),
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
