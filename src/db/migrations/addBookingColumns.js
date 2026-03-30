// Adds payment_status and qr_code columns to bookings table
const pool = require('../index');

const addBookingColumns = async () => {
  try {
    await pool.query(`
      ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20),
        ADD COLUMN IF NOT EXISTS qr_code        TEXT;
    `);
    console.log('✅ Booking columns added successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
};

addBookingColumns();
