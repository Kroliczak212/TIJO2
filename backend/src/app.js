/**
 * VetCRM Receptionist Module - Main Application
 *
 * Express.js server for the standalone receptionist module
 *
 * @author Bartłomiej Król
 */

const express = require('express');
const cors = require('cors');
const config = require('./config');
const { initializeSchema } = require('./config/database');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const clientsRoutes = require('./routes/clients.routes');
const petsRoutes = require('./routes/pets.routes');
const appointmentsRoutes = require('./routes/appointments.routes');
const doctorsRoutes = require('./routes/doctors.routes');
const calculatorsRoutes = require('./routes/calculators.routes');

// Create Express app
const app = express();

// Initialize database schema
// Initialize database schema (skip in tests)
if (process.env.NODE_ENV !== 'test') {
  initializeSchema();
}

// Middleware
app.use(cors());
app.use(express.json());

// Request logging (development)
if (config.env === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'VetCRM API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/calculators', calculatorsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    module: 'VetCRM Receptionist Module'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint nie znaleziony',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Wystąpił błąd serwera';

  res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR'
  });
});

// Start server (only if not in test mode)
if (process.env.NODE_ENV !== 'test') {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════╗
║     VetCRM Receptionist Module                     ║
║     Server running on http://localhost:${PORT}        ║
╠════════════════════════════════════════════════════╣
║  Endpoints:                                        ║
║  - POST /api/auth/login                            ║
║  - GET  /api/clients                               ║
║  - GET  /api/pets                                  ║
║  - GET  /api/appointments                          ║
║  - GET  /api/doctors                               ║
║  - POST /api/calculators/pet-age                   ║
║  - POST /api/calculators/dosage                    ║
║  - POST /api/calculators/bmi                       ║
╚════════════════════════════════════════════════════╝
    `);
  });
}

module.exports = app;
