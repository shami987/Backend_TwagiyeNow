// Drops all tables and recreates them with UUID primary keys
const pool = require('../index');

const resetWithUUID = async () => {
  const query = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    DROP TABLE IF EXISTS bookings CASCADE;
    DROP TABLE IF EXISTS bus_locations CASCADE;
    DROP TABLE IF EXISTS private_cars CASCADE;
    DROP TABLE IF EXISTS schedules CASCADE;
    DROP TABLE IF EXISTS buses CASCADE;
    DROP TABLE IF EXISTS routes CASCADE;
    DROP TABLE IF EXISTS users CASCADE;

    CREATE TABLE users (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(100)  NOT NULL,
      email       VARCHAR(150)  UNIQUE NOT NULL,
      password    VARCHAR(255)  NOT NULL,
      role        VARCHAR(20)   DEFAULT 'user',
      otp         VARCHAR(6),
      otp_expires TIMESTAMP,
      created_at  TIMESTAMP     DEFAULT NOW()
    );

    CREATE TABLE routes (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      from_city   VARCHAR(100) NOT NULL,
      to_city     VARCHAR(100) NOT NULL,
      distance_km INTEGER,
      created_at  TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE buses (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(100) NOT NULL,
      plate       VARCHAR(20) UNIQUE NOT NULL,
      capacity    INTEGER NOT NULL,
      created_at  TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE schedules (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      route_id       UUID REFERENCES routes(id) ON DELETE CASCADE,
      bus_id         UUID REFERENCES buses(id) ON DELETE CASCADE,
      departure_time TIMESTAMP NOT NULL,
      price          NUMERIC(10,2) NOT NULL,
      created_at     TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE bookings (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
      schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
      seat_number INTEGER NOT NULL,
      status      VARCHAR(20) DEFAULT 'confirmed',
      created_at  TIMESTAMP DEFAULT NOW(),
      UNIQUE(schedule_id, seat_number)
    );

    CREATE TABLE bus_locations (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bus_id     UUID UNIQUE REFERENCES buses(id) ON DELETE CASCADE,
      latitude   DECIMAL(10, 8) NOT NULL,
      longitude  DECIMAL(11, 8) NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE private_cars (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      driver_name  VARCHAR(100) NOT NULL,
      plate        VARCHAR(20) UNIQUE NOT NULL,
      car_model    VARCHAR(100) NOT NULL,
      capacity     INTEGER NOT NULL,
      price_per_km NUMERIC(10,2) NOT NULL,
      available    BOOLEAN DEFAULT TRUE,
      latitude     DECIMAL(10, 8),
      longitude    DECIMAL(11, 8),
      created_at   TIMESTAMP DEFAULT NOW()
    );
  `;

  try {
    await pool.query(query);
    console.log('✅ All tables recreated with UUID');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
};

resetWithUUID();
