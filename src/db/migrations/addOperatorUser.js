const pool = require('../index');
const bcrypt = require('bcryptjs');

const addOperator = async () => {
  try {
    const hashed = await bcrypt.hash('operator123', 10);
    await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Bus Operator', 'operator@twagiyenow.com', $1, 'operator')
      ON CONFLICT (email) DO UPDATE SET role = 'operator', password = $1;
    `, [hashed]);
    console.log('✅ Operator user created');
    console.log('📧 Email: operator@twagiyenow.com');
    console.log('🔑 Password: operator123');
  } catch (err) {
    console.error('❌ Failed:', err.message);
  } finally {
    await pool.end();
  }
};

addOperator();
