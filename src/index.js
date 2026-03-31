// Express app entry point
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const routeRoutes = require('./routes/routeRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const busRoutes = require('./routes/busRoutes');
const privateCarRoutes = require('./routes/privateCarRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminStatsRoutes = require('./routes/adminStatsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ussdRoutes = require('./routes/ussdRoutes');

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/private-cars', privateCarRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminStatsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ussd', ussdRoutes);
app.use('/ussd', ussdRoutes); // Africa's Talking compatible path

// Swagger docs — available at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start server and verify DB connection
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    const pool = require('./db');
    await pool.query('SELECT 1');
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
});
