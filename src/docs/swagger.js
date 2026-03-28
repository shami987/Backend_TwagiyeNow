// Swagger configuration and API documentation
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TwagiyeNow API',
      version: '1.0.0',
      description: 'Bus ticketing API for TwagiyeNow app',
    },
    servers: [{ url: 'http://localhost:5000' }],
    security: [{ bearerAuth: [] }], // Apply globally to all endpoints
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        SignupRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name:     { type: 'string', example: 'John Doe' },
            email:    { type: 'string', example: 'john@example.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
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
            id:    { type: 'integer', example: 1 },
            name:  { type: 'string',  example: 'John Doe' },
            email: { type: 'string',  example: 'john@example.com' },
          },
        },
        Bus: {
          type: 'object',
          properties: {
            id:       { type: 'integer', example: 1 },
            name:     { type: 'string',  example: 'Volcano Express' },
            plate:    { type: 'string',  example: 'RAB 123A' },
            capacity: { type: 'integer', example: 30 },
          },
        },
        Route: {
          type: 'object',
          properties: {
            id:          { type: 'integer', example: 1 },
            from_city:   { type: 'string',  example: 'Kigali' },
            to_city:     { type: 'string',  example: 'Musanze' },
            distance_km: { type: 'integer', example: 110 },
          },
        },
        Schedule: {
          type: 'object',
          properties: {
            id:              { type: 'integer', example: 1 },
            from_city:       { type: 'string',  example: 'Kigali' },
            to_city:         { type: 'string',  example: 'Musanze' },
            departure_time:  { type: 'string',  example: '2025-04-01T08:00:00Z' },
            price:           { type: 'number',  example: 2500 },
            bus_name:        { type: 'string',  example: 'Volcano Express' },
            plate:           { type: 'string',  example: 'RAB 123A' },
            available_seats: { type: 'integer', example: 30 },
          },
        },
        BookingRequest: {
          type: 'object',
          required: ['schedule_id', 'seat_numbers'],
          properties: {
            schedule_id:  { type: 'integer', example: 1 },
            seat_numbers: { type: 'array', items: { type: 'integer' }, example: [1, 2, 3] },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id:             { type: 'integer', example: 1 },
            seat_number:    { type: 'integer', example: 5 },
            status:         { type: 'string',  example: 'confirmed' },
            from_city:      { type: 'string',  example: 'Kigali' },
            to_city:        { type: 'string',  example: 'Musanze' },
            departure_time: { type: 'string',  example: '2025-04-01T08:00:00Z' },
            price:          { type: 'number',  example: 2500 },
            bus_name:       { type: 'string',  example: 'Volcano Express' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Error message' },
          },
        },
      },
    },
    paths: {
      // AUTH
      '/api/auth/signup': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          security: [],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SignupRequest' } } },
          },
          responses: {
            201: { description: 'User created', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            400: { description: 'Email already in use' },
          },
        },
      },
      '/api/auth/forgot-password': {
        post: {
          tags: ['Auth'],
          summary: 'Send OTP code to email',
          security: [],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', example: 'john@example.com' } } } } },
          },
          responses: {
            200: { description: 'OTP sent to email' },
            404: { description: 'No account found with that email' },
          },
        },
      },
      '/api/auth/verify-otp': {
        post: {
          tags: ['Auth'],
          summary: 'Verify the OTP code',
          security: [],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['email','otp'], properties: { email: { type: 'string', example: 'john@example.com' }, otp: { type: 'string', example: '123456' } } } } },
          },
          responses: {
            200: { description: 'Code verified' },
            400: { description: 'Invalid or expired code' },
          },
        },
      },
      '/api/auth/reset-password': {
        post: {
          tags: ['Auth'],
          summary: 'Reset password using verified OTP',
          security: [],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['email','otp','password'], properties: { email: { type: 'string', example: 'john@example.com' }, otp: { type: 'string', example: '123456' }, password: { type: 'string', example: 'newpassword123' } } } } },
          },
          responses: {
            200: { description: 'Password reset successful' },
            400: { description: 'Invalid or expired code' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login and get JWT token',
          security: [],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
          },
          responses: {
            200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            400: { description: 'Invalid credentials' },
          },
        },
      },
      // ROUTES
      '/api/routes': {
        get: {
          tags: ['Routes'],
          summary: 'Get all bus routes',
          security: [],
          responses: {
            200: { description: 'List of routes', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Route' } } } } },
          },
        },
      },
      '/api/routes/{id}': {
        get: {
          tags: ['Routes'],
          summary: 'Get a single route by ID',
          security: [],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Route detail', content: { 'application/json': { schema: { $ref: '#/components/schemas/Route' } } } },
            404: { description: 'Route not found' },
          },
        },
      },
      // BUSES (public)
      '/api/buses': {
        get: {
          tags: ['Buses'],
          summary: 'Get all buses',
          security: [],
          responses: {
            200: { description: 'List of buses', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Bus' } } } } },
          },
        },
      },
      '/api/buses/{id}': {
        get: {
          tags: ['Buses'],
          summary: 'Get a single bus by ID',
          security: [],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Bus detail' },
            404: { description: 'Bus not found' },
          },
        },
      },
      // SCHEDULES
      '/api/schedules': {
        get: {
          tags: ['Schedules'],
          summary: 'Search available buses',
          security: [],
          parameters: [
            { name: 'from', in: 'query', required: true, schema: { type: 'string' }, example: 'Kigali' },
            { name: 'to',   in: 'query', required: true, schema: { type: 'string' }, example: 'Musanze' },
            { name: 'date', in: 'query', required: true, schema: { type: 'string' }, example: '2025-04-01' },
          ],
          responses: {
            200: { description: 'Available schedules', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Schedule' } } } } },
          },
        },
      },
      '/api/schedules/{id}/seats': {
        get: {
          tags: ['Schedules'],
          summary: 'Get seat availability for a schedule',
          security: [],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Schedule ID' }],
          responses: {
            200: { description: 'Seat map with available/booked status' },
            404: { description: 'Schedule not found' },
          },
        },
      },
      '/api/admin/routes': {
        post: {
          tags: ['Admin'],
          summary: 'Add a new route',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['from_city','to_city'], properties: { from_city: { type: 'string', example: 'Kigali' }, to_city: { type: 'string', example: 'Musanze' }, distance_km: { type: 'integer', example: 110 } } } } } },
          responses: { 201: { description: 'Route created' }, 403: { description: 'Admins only' } },
        },
      },
      '/api/admin/routes/{id}': {
        put: {
          tags: ['Admin'],
          summary: 'Update a route',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { from_city: { type: 'string' }, to_city: { type: 'string' }, distance_km: { type: 'integer' } } } } } },
          responses: { 200: { description: 'Route updated' }, 404: { description: 'Route not found' } },
        },
        delete: {
          tags: ['Admin'],
          summary: 'Delete a route',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Route deleted' }, 404: { description: 'Route not found' } },
        },
      },
      '/api/admin/buses': {
        get: {
          tags: ['Admin'],
          summary: 'List all buses',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of buses' } },
        },
        post: {
          tags: ['Admin'],
          summary: 'Add a new bus',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name','plate','capacity'], properties: { name: { type: 'string', example: 'Volcano Express' }, plate: { type: 'string', example: 'RAB 123A' }, capacity: { type: 'integer', example: 30 } } } } } },
          responses: { 201: { description: 'Bus created' } },
        },
      },
      '/api/admin/buses/{id}': {
        put: {
          tags: ['Admin'],
          summary: 'Update a bus',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, plate: { type: 'string' }, capacity: { type: 'integer' } } } } } },
          responses: { 200: { description: 'Bus updated' }, 404: { description: 'Bus not found' } },
        },
        delete: {
          tags: ['Admin'],
          summary: 'Delete a bus',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Bus deleted' }, 404: { description: 'Bus not found' } },
        },
      },
      '/api/admin/schedules': {
        post: {
          tags: ['Admin'],
          summary: 'Add a new schedule',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['route_id','bus_id','departure_time','price'], properties: { route_id: { type: 'integer', example: 1 }, bus_id: { type: 'integer', example: 1 }, departure_time: { type: 'string', example: '2025-04-01T08:00:00Z' }, price: { type: 'number', example: 2500 } } } } } },
          responses: { 201: { description: 'Schedule created' } },
        },
      },
      '/api/admin/schedules/{id}': {
        put: {
          tags: ['Admin'],
          summary: 'Update a schedule',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { route_id: { type: 'integer' }, bus_id: { type: 'integer' }, departure_time: { type: 'string' }, price: { type: 'number' } } } } } },
          responses: { 200: { description: 'Schedule updated' }, 404: { description: 'Schedule not found' } },
        },
        delete: {
          tags: ['Admin'],
          summary: 'Delete a schedule',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Schedule deleted' }, 404: { description: 'Schedule not found' } },
        },
      },
      // BOOKINGS
      '/api/bookings': {
        post: {
          tags: ['Bookings'],
          summary: 'Book a seat',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/BookingRequest' } } },
          },
          responses: {
            201: { description: 'Booking confirmed' },
            400: { description: 'Seat already booked' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/bookings/my': {
        get: {
          tags: ['Bookings'],
          summary: 'Get my booked tickets',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'List of bookings' },
            401: { description: 'Unauthorized' },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
