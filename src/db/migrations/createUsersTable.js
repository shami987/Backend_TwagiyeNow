const pool = require('../index');

const createUsersTable = async () => {
  const query = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS users (
      id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(100)  NOT NULL,
      email       VARCHAR(150)  UNIQUE NOT NULL,
      password    VARCHAR(255)  NOT NULL,
      role        VARCHAR(20)   DEFAULT 'user',
      created_at  TIMESTAMP     DEFAULT NOW()
    );
  `;

  try {
    await pool.query(query);
    console.log('✅ Users table created successfully');
  } catch (err) {
    console.error('❌ Error creating users table:', err.message);
  } finally {
    await pool.end();
  }
};

createUsersTable();
