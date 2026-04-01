const pool = require('../index');

const createDriversTable = async () => {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE TABLE IF NOT EXISTS drivers (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(100) NOT NULL,
      license     VARCHAR(50)  UNIQUE NOT NULL,
      phone       VARCHAR(20),
      status      VARCHAR(20)  DEFAULT 'off-duty',
      assigned_bus_id UUID REFERENCES buses(id) ON DELETE SET NULL,
      created_at  TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ drivers table created');
  process.exit(0);
};

createDriversTable().catch(err => { console.error(err); process.exit(1); });
