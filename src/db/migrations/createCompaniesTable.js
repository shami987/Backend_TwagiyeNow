const pool = require('../index');

const createCompaniesTable = async () => {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS companies (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name         VARCHAR(100) NOT NULL,
      email        VARCHAR(150) UNIQUE NOT NULL,
      phone        VARCHAR(20),
      status       VARCHAR(20) DEFAULT 'pending',
      license      VARCHAR(20) DEFAULT 'pending',
      insurance    VARCHAR(20) DEFAULT 'pending',
      applied_date DATE DEFAULT CURRENT_DATE,
      created_at   TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ companies table created');
  process.exit(0);
};

createCompaniesTable().catch(err => { console.error(err); process.exit(1); });
