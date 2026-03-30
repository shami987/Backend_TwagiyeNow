// Migrates all tables from SERIAL integer IDs to UUID
const pool = require('../index');

const migrateToUUID = async () => {
  const query = `
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- USERS
    ALTER TABLE users ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
    UPDATE users SET uuid = gen_random_uuid() WHERE uuid IS NULL;
    ALTER TABLE users ALTER COLUMN uuid SET NOT NULL;

    -- BUSES
    ALTER TABLE buses ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
    UPDATE buses SET uuid = gen_random_uuid() WHERE uuid IS NULL;
    ALTER TABLE buses ALTER COLUMN uuid SET NOT NULL;

    -- ROUTES
    ALTER TABLE routes ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
    UPDATE routes SET uuid = gen_random_uuid() WHERE uuid IS NULL;
    ALTER TABLE routes ALTER COLUMN uuid SET NOT NULL;

    -- SCHEDULES
    ALTER TABLE schedules ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
    UPDATE schedules SET uuid = gen_random_uuid() WHERE uuid IS NULL;
    ALTER TABLE schedules ALTER COLUMN uuid SET NOT NULL;

    -- BOOKINGS
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
    UPDATE bookings SET uuid = gen_random_uuid() WHERE uuid IS NULL;
    ALTER TABLE bookings ALTER COLUMN uuid SET NOT NULL;
  `;

  try {
    await pool.query(query);
    console.log('✅ UUID columns added to all tables');
  } catch (err) {
    console.error('❌ UUID migration failed:', err.message);
  } finally {
    await pool.end();
  }
};

migrateToUUID();
