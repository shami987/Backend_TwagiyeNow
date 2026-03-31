// Seeds the database with admin user, routes, buses, schedules, and private cars
const pool = require('./index');
const bcrypt = require('bcryptjs');

const seed = async () => {
  try {
    // Admin user
    const hashed = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Admin', 'admin@twagiyenow.com', $1, 'admin')
      ON CONFLICT (email) DO NOTHING;
    `, [hashed]);
    console.log('✅ Admin user seeded');

    // Routes
    const routes = await pool.query(`
      INSERT INTO routes (from_city, to_city, distance_km) VALUES
        ('Kigali', 'Musanze', 110),
        ('Kigali', 'Huye', 130),
        ('Kigali', 'Rubavu', 160),
        ('Kigali', 'Nyagatare', 180),
        ('Kigali', 'Rusizi', 220)
      RETURNING id, from_city, to_city;
    `);
    console.log('✅ Routes seeded:', routes.rows.map(r => `${r.from_city} → ${r.to_city}`).join(', '));

    // Buses
    const buses = await pool.query(`
      INSERT INTO buses (name, plate, capacity) VALUES
        ('Volcano Express', 'RAB 123A', 30),
        ('Horizon Bus',     'RAC 456B', 35),
        ('Royal Express',   'RAD 789C', 28),
        ('Kigali Coach',    'RAE 012D', 40),
        ('Swift Mover',     'RAF 345E', 25)
      RETURNING id, name;
    `);
    console.log('✅ Buses seeded:', buses.rows.map(b => b.name).join(', '));

    // Schedules — use returned IDs
    const r = routes.rows;
    const b = buses.rows;
    // Use a fixed future date in 2026
    const d = '2026-03-31';

    await pool.query(`
      INSERT INTO schedules (route_id, bus_id, departure_time, price) VALUES
        ($1, $6,  '${d} 06:00:00', 2500),
        ($1, $7,  '${d} 10:00:00', 2500),
        ($2, $8,  '${d} 07:00:00', 3000),
        ($3, $9,  '${d} 08:00:00', 3500),
        ($4, $10, '${d} 09:00:00', 4000),
        ($5, $6,  '${d} 11:00:00', 5000);
    `, [r[0].id, r[1].id, r[2].id, r[3].id, r[4].id, b[0].id, b[1].id, b[2].id, b[3].id, b[4].id]);
    console.log(`✅ Schedules seeded for ${d}`);

    // Private cars
    await pool.query(`
      INSERT INTO private_cars (driver_name, plate, car_model, capacity, price_per_km) VALUES
        ('Jean Pierre',  'RAG 001A', 'Toyota Corolla',  4, 500),
        ('Marie Claire', 'RAH 002B', 'Honda Fit',       4, 450),
        ('Patrick Nkusi','RAI 003C', 'Toyota RAV4',     6, 700),
        ('Alice Uwase',  'RAJ 004D', 'Suzuki Swift',    4, 400),
        ('Eric Mugisha', 'RAK 005E', 'Toyota Hiace',   14, 300)
      ON CONFLICT (plate) DO NOTHING;
    `);
    console.log('✅ Private cars seeded');

    console.log('\n🎉 All data seeded successfully!');
    console.log('📧 Admin email: admin@twagiyenow.com');
    console.log('🔑 Admin password: admin123');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await pool.end();
  }
};

seed();
