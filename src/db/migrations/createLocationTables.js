// Creates bus_locations and private_cars tables
const pool = require('../index');

const createNewTables = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS bus_locations (
      id         SERIAL PRIMARY KEY,
      bus_id     INTEGER REFERENCES buses(id) ON DELETE CASCADE,
      latitude   DECIMAL(10, 8) NOT NULL,
      longitude  DECIMAL(11, 8) NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS private_cars (
      id           SERIAL PRIMARY KEY,
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
    console.log('✅ bus_locations and private_cars tables created');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
};

createNewTables();
