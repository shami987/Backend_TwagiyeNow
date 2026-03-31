// Swagger configuration and API documentation
const swaggerJsdoc = require('swagger-jsdoc');

const UUID_EXAMPLE = '550e8400-e29b-41d4-a716-446655440000';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TwagiyeNow API',
      version: '1.0.0',
      description: 'Bus ticketing API for TwagiyeNow app',
    },
    servers: [{ url: 'http://localhost:5000' }],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        SignupRequest: {
          type: 'object', required: ['name', 'email', 'password'],
          properties: {
            name:     { type: 'string', example: 'John Doe' },
            email:    { type: 'string', example: 'john@example.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
        LoginRequest: {
          type: 'object', required: ['email', 'password'],
          properties: {
            email:    { type: 'string', example: 'john@example.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user:  { $ref: '#/components/schemas/User' },
            token: { type: 'string', example: 'eyJhbGci...' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id:    { type: 'string', format: 'uuid', example: UUID_EXAMPLE },
            name:  { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role:  { type: 'string', example: 'user' },
          },
        },
        Bus: {
          type: 'object',
          properties: {
            id:       { type: 'string', format: 'uuid', example: UUID_EXAMPLE },
            name:     { type: 'string',  example: 'Volcano Express' },
            plate:    { type: 'string',  example: 'RAB 123A' },
            capacity: { type: 'integer', example: 30 },
          },
        },
        Route: {
          type: 'object',
          properties: {
            id:          { type: 'string', format: 'uuid', example: UUID_EXAMPLE },
            from_city:   { type: 'string',  example: 'Kigali' },
            to_city:     { type: 'string',  example: 'Musanze' },
            distance_km: { type: 'integer', example: 110 },
          },
        },
        Schedule: {
          type: 'object',
          properties: {
            id:              { type: 'string', format: 'uuid', example: UUID_EXAMPLE },
            from_city:       { type: 'string',  example: 'Kigali' },
            to_city:         { type: 'string',  example: 'Musanze' },
            departure_time:  { type: 'string',  example: '2025-05-01T08:00:00Z' },
            price:           { type: 'number',  example: 2500 },
            bus_name:        { type: 'string',  example: 'Volcano Express' },
            plate:           { type: 'string',  example: 'RAB 123A' },
            available_seats: { type: 'integer', example: 30 },
          },
        },
        BookingRequest: {
          type: 'object', required: ['schedule_id', 'seat_numbers'],
          properties: {
            schedule_id:  { type: 'string', format: 'uuid', example: UUID_EXAMPLE },
            seat_numbers: { type: 'array', items: { type: 'integer' }, example: [1, 2, 3] },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id:             { type: 'string', format: 'uuid', example: UUID_EXAMPLE },
            seat_number:    { type: 'integer', example: 5 },
            status:         { type: 'string',  example: 'confirmed' },
            payment_status: { type: 'string',  example: 'pending' },
            payment_method: { type: 'string',  example: 'momo' },
            qr_code:        { type: 'string',  example: 'abc123hash...' },
            from_city:      { type: 'string',  example: 'Kigali' },
            to_city:        { type: 'string',  example: 'Musanze' },
            departure_time: { type: 'string',  example: '2025-05-01T08:00:00Z' },
            price:          { type: 'number',  example: 2500 },
            bus_name:       { type: 'string',  example: 'Volcano Express' },
          },
        },
        PrivateCar: {
          type: 'object',
          properties: {
            id:           { type: 'string', format: 'uuid', example: UUID_EXAMPLE },
            driver_name:  { type: 'string',  example: 'Jean Pierre' },
            plate:        { type: 'string',  example: 'RAC 001B' },
            car_model:    { type: 'string',  example: 'Toyota Corolla' },
            capacity:     { type: 'integer', example: 4 },
            price_per_km: { type: 'number',  example: 500 },
            available:    { type: 'boolean', example: true },
          },
        },
        Error: {
          type: 'object',
          properties: { message: { type: 'string', example: 'Error message' } },
        },
      },
    },
    paths: {

      // ─── AUTH ────────────────────────────────────────────────────────────────
      '/api/auth/signup': {
        post: {
          tags: ['Auth'], summary: 'Register a new user', security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SignupRequest' } } } },
          responses: { 201: { description: 'User created' }, 400: { description: 'Email already in use' } },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'], summary: 'Login and get JWT token', security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
          responses: { 200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } }, 400: { description: 'Invalid credentials' } },
        },
      },
      '/api/auth/forgot-password': {
        post: {
          tags: ['Auth'], summary: 'Send OTP to email for password reset', security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', example: 'john@example.com' } } } } } },
          responses: { 200: { description: 'OTP sent to email' }, 404: { description: 'No account found' } },
        },
      },
      '/api/auth/verify-otp': {
        post: {
          tags: ['Auth'], summary: 'Verify OTP code', security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email','otp'], properties: { email: { type: 'string', example: 'john@example.com' }, otp: { type: 'string', example: '123456' } } } } } },
          responses: { 200: { description: 'OTP verified' }, 400: { description: 'Invalid or expired OTP' } },
        },
      },
      '/api/auth/reset-password': {
        post: {
          tags: ['Auth'], summary: 'Reset password after OTP verified', security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email','otp','newPassword'], properties: { email: { type: 'string', example: 'john@example.com' }, otp: { type: 'string', example: '123456' }, newPassword: { type: 'string', example: 'newpassword123' } } } } } },
          responses: { 200: { description: 'Password reset successfully' }, 400: { description: 'Invalid or expired OTP' } },
        },
      },

      // ─── ROUTES ──────────────────────────────────────────────────────────────
      '/api/routes/search': {
        get: {
          tags: ['Routes'], summary: 'Search routes by origin, destination, date', security: [],
          parameters: [
            { name: 'from', in: 'query', required: true, schema: { type: 'string' }, example: 'Kigali' },
            { name: 'to',   in: 'query', required: true, schema: { type: 'string' }, example: 'Musanze' },
            { name: 'date', in: 'query', required: true, schema: { type: 'string' }, example: '2025-05-01' },
          ],
          responses: { 200: { description: 'Matching routes with schedules' } },
        },
      },
      '/api/routes': {
        get: {
          tags: ['Routes'], summary: 'List all routes', security: [],
          responses: { 200: { description: 'List of routes', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Route' } } } } } },
        },
        post: {
          tags: ['Routes'], summary: 'Add a new route [Admin]', security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['from_city','to_city'], properties: { from_city: { type: 'string', example: 'Kigali' }, to_city: { type: 'string', example: 'Musanze' }, distance_km: { type: 'integer', example: 110 } } } } } },
          responses: { 201: { description: 'Route created' }, 403: { description: 'Admins only' } },
        },
      },
      '/api/routes/{id}': {
        get: {
          tags: ['Routes'], summary: 'Get a single route', security: [],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Route detail' }, 404: { description: 'Not found' } },
        },
        put: {
          tags: ['Routes'], summary: 'Update a route [Admin]', security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { from_city: { type: 'string' }, to_city: { type: 'string' }, distance_km: { type: 'integer' } } } } } },
          responses: { 200: { description: 'Route updated' }, 404: { description: 'Not found' } },
        },
        delete: {
          tags: ['Routes'], summary: 'Delete a route [Admin]', security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Route deleted' }, 404: { description: 'Not found' } },
        },
      },
      '/api/routes/{id}/buses': {
        get: {
          tags: ['Routes'], summary: 'List all buses for a specific route', security: [],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'List of buses on this route' } },
        },
      },

      // ─── BUSES ───────────────────────────────────────────────────────────────
      '/api/buses': {
        get: {
          tags: ['Buses'], summary: 'List all buses', security: [],
          responses: { 200: { description: 'List of buses', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Bus' } } } } } },
        },
        post: {
          tags: ['Buses'], summary: 'Add a new bus [Admin]', security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name','plate','capacity'], properties: { name: { type: 'string', example: 'Volcano Express' }, plate: { type: 'string', example: 'RAB 123A' }, capacity: { type: 'integer', example: 30 } } } } } },
          responses: { 201: { description: 'Bus created' }, 403: { description: 'Admins only' } },
        },
      },
      '/api/buses/{id}': {
        get: {
          tags: ['Buses'], summary: 'Get a single bus', security: [],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Bus detail' }, 404: { description: 'Not found' } },
        },
        put: {
          tags: ['Buses'], summary: 'Update a bus [Admin]', security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, plate: { type: 'string' }, capacity: { type: 'integer' } } } } } },
          responses: { 200: { description: 'Bus updated' }, 404: { description: 'Not found' } },
        },
        delete: {
          tags: ['Buses'], summary: 'Delete a bus [Admin]', security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Bus deleted' }, 404: { description: 'Not found' } },
        },
      },
      '/api/buses/{id}/seats': {
        get: {
          tags: ['Buses'], summary: 'Get real-time seat availability for a bus', security: [],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Seat availability per schedule' }, 404: { description: 'No schedules found' } },
        },
      },
      '/api/buses/{id}/schedule': {
        get: {
          tags: ['Buses'], summary: 'Get departure and arrival schedule for a bus', security: [],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Bus schedule list' }, 404: { description: 'No schedule found' } },
        },
      },
      '/api/buses/{id}/location': {
        get: {
          tags: ['Buses'], summary: 'Get current GPS location of a bus', security: [],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Bus GPS coordinates' }, 404: { description: 'No location found' } },
        },
        put: {
          tags: ['Buses'], summary: 'Update bus GPS location', security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['latitude','longitude'], properties: { latitude: { type: 'number', example: -1.9441 }, longitude: { type: 'number', example: 30.0619 } } } } } },
          responses: { 200: { description: 'Location updated' } },
        },
      },

      // ─── SCHEDULES ───────────────────────────────────────────────────────────
      '/api/schedules': {
        get: {
          tags: ['Schedules'], summary: 'Search available buses', security: [],
          parameters: [
            { name: 'from', in: 'query', required: true, schema: { type: 'string' }, example: 'Kigali' },
            { name: 'to',   in: 'query', required: true, schema: { type: 'string' }, example: 'Musanze' },
            { name: 'date', in: 'query', required: true, schema: { type: 'string' }, example: '2025-05-01' },
          ],
          responses: { 200: { description: 'Available schedules' } },
        },
        post: {
          tags: ['Schedules'], summary: 'Add a new schedule [Admin]', security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['route_id','bus_id','departure_time','price'], properties: { route_id: { type: 'string', format: 'uuid', example: UUID_EXAMPLE }, bus_id: { type: 'string', format: 'uuid', example: UUID_EXAMPLE }, departure_time: { type: 'string', example: '2025-05-01T08:00:00Z' }, price: { type: 'number', example: 2500 } } } } } },
          responses: { 201: { description: 'Schedule created' }, 403: { description: 'Admins only' } },
        },
      },
      '/api/schedules/{id}': {
        put: {
          tags: ['Schedules'], summary: 'Update a schedule [Admin]', security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { route_id: { type: 'string', format: 'uuid' }, bus_id: { type: 'string', format: 'uuid' }, departure_time: { type: 'string' }, price: { type: 'number' } } } } } },
          responses: { 200: { description: 'Schedule updated' }, 404: { description: 'Not found' } },
        },
        delete: {
          tags: ['Schedules'], summary: 'Delete a schedule [Admin]', security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Schedule deleted' }, 404: { description: 'Not found' } },
        },
      },
      '/api/schedules/{id}/seats': {
        get: {
          tags: ['Schedules'], summary: 'Get real-time seat availability for a schedule', security: [],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Seat map', content: { 'application/json': { schema: { type: 'object', properties: { schedule_id: { type: 'string', format: 'uuid' }, capacity: { type: 'integer', example: 30 }, seats: { type: 'array', items: { type: 'object', properties: { seat_number: { type: 'integer', example: 1 }, status: { type: 'string', example: 'available' } } } } } } } } },
            404: { description: 'Schedule not found' },
          },
        },
      },

      // ─── PRIVATE CARS ────────────────────────────────────────────────────────
      '/api/private-cars': {
        get: {
          tags: ['Private Cars'], summary: 'List all available private cars', security: [],
          responses: { 200: { description: 'List of available private cars', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/PrivateCar' } } } } } },
        },
        post: {
          tags: ['Private Cars'], summary: 'Add a new private car [Admin]', security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['driver_name','plate','car_model','capacity','price_per_km'], properties: { driver_name: { type: 'string', example: 'Jean Pierre' }, plate: { type: 'string', example: 'RAC 001B' }, car_model: { type: 'string', example: 'Toyota Corolla' }, capacity: { type: 'integer', example: 4 }, price_per_km: { type: 'number', example: 500 } } } } } },
          responses: { 201: { description: 'Car added' }, 403: { description: 'Admins only' } },
        },
      },
      '/api/private-cars/book': {
        post: {
          tags: ['Private Cars'], summary: 'Book a private car', security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['car_id','pickup_location','dropoff_location','pickup_time','distance_km'], properties: { car_id: { type: 'string', format: 'uuid', example: UUID_EXAMPLE }, pickup_location: { type: 'string', example: 'Kigali City Center' }, dropoff_location: { type: 'string', example: 'Kigali Airport' }, pickup_time: { type: 'string', example: '2026-03-31T08:00:00Z' }, distance_km: { type: 'number', example: 15 } } } } } },
          responses: { 201: { description: 'Car booked' }, 404: { description: 'Car not available' } },
        },
      },
      '/api/private-cars/book/{id}/pay': {
        post: {
          tags: ['Private Cars'], summary: 'Pay for a private car booking', security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['payment_method'], properties: { payment_method: { type: 'string', enum: ['momo', 'airtel'], example: 'momo' } } } } } },
          responses: { 200: { description: 'Payment confirmed' }, 400: { description: 'Already paid' } },
        },
      },
      '/api/private-cars/my-bookings': {
        get: {
          tags: ['Private Cars'], summary: 'Get my private car bookings', security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of my car bookings' } },
        },
      },
      '/api/private-cars/book/{id}/cancel': {
        put: {
          tags: ['Private Cars'], summary: 'Cancel a private car booking', security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Booking cancelled' }, 404: { description: 'Not found' } },
        },
      },
      '/api/private-cars/{id}': {
        delete: {
          tags: ['Private Cars'], summary: 'Delete a private car [Admin]', security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Car deleted' }, 404: { description: 'Not found' } },
        },
      },

      // ─── BOOKINGS ────────────────────────────────────────────────────────────
      '/api/bookings': {
        post: {
          tags: ['Bookings'], summary: 'Create booking and lock selected seats', security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BookingRequest' } } } },
          responses: { 201: { description: 'Booking created' }, 400: { description: 'Seat already booked' }, 401: { description: 'Unauthorized' } },
        },
      },
      '/api/bookings/my': {
        get: {
          tags: ['Bookings'], summary: 'Get all bookings for the logged-in user', security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of bookings' }, 401: { description: 'Unauthorized' } },
        },
      },
      '/api/bookings/{id}': {
        get: {
          tags: ['Bookings'], summary: 'Get booking details and QR code', security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Booking details with QR code' }, 404: { description: 'Booking not found' } },
        },
      },
      '/api/bookings/{id}/pay': {
        post: {
          tags: ['Bookings'], summary: 'Confirm MoMo/Airtel payment for booking', security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['payment_method'], properties: { payment_method: { type: 'string', enum: ['momo', 'airtel'], example: 'momo' } } } } } },
          responses: { 200: { description: 'Payment confirmed, QR code generated' }, 400: { description: 'Already paid' }, 404: { description: 'Booking not found' } },
        },
      },
      '/api/bookings/{id}/cancel': {
        put: {
          tags: ['Bookings'], summary: 'Cancel a booking', security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Booking cancelled' }, 400: { description: 'Already cancelled' }, 404: { description: 'Booking not found' } },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
