// Creates the users table if it doesn't exist
const pool = require('../index');

const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(100)  NOT NULL,
      email       VARCHAR(150)  UNIQUE NOT NULL,
      password    VARCHAR(255)  NOT NULL,
      created_at  TIMESTAMP     DEFAULT NOW()
    );
  `;

  try {
    await pool.query(query);
    console.log('✅ Users table created successfully');
  } catch (err) {
    console.error('❌ Error creating users table:', err.message);
  } finally {
    await pool.end(); // Close pool after migration
  }
};

createUsersTable();
