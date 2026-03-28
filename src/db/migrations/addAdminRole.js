// Adds role column to users and creates a default admin account
const pool = require('../index');
const bcrypt = require('bcryptjs');

const addAdminRole = async () => {
  try {
    // Add role column with default 'user'
    await pool.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
    `);

    // Create default admin user
    const hashed = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Admin', 'admin@twagiyenow.com', $1, 'admin')
      ON CONFLICT (email) DO NOTHING;
    `, [hashed]);

    console.log('✅ Role column added and admin user created');
    console.log('📧 Email: admin@twagiyenow.com');
    console.log('🔑 Password: admin123');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
};

addAdminRole();
