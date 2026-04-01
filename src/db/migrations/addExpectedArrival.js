const pool = require('../index');

const addExpectedArrival = async () => {
  await pool.query(`
    ALTER TABLE schedules
    ADD COLUMN IF NOT EXISTS expected_arrival TIMESTAMP;
  `);
  console.log('✅ expected_arrival column added to schedules');
  process.exit(0);
};

addExpectedArrival().catch(err => { console.error(err); process.exit(1); });
