// Creates private_car_bookings table
const pool = require('../index');

const createPrivateCarBookings = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS private_car_bookings (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
        car_id          UUID REFERENCES private_cars(id) ON DELETE CASCADE,
        pickup_location VARCHAR(200) NOT NULL,
        dropoff_location VARCHAR(200) NOT NULL,
        pickup_time     TIMESTAMP NOT NULL,
        distance_km     NUMERIC(10,2),
        total_price     NUMERIC(10,2),
        payment_method  VARCHAR(20),
        payment_status  VARCHAR(20) DEFAULT 'pending',
        status          VARCHAR(20) DEFAULT 'confirmed',
        qr_code         TEXT,
        created_at      TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ private_car_bookings table created');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
};

createPrivateCarBookings();
