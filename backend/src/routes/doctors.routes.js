/**
 * Doctors Routes
 *
 * @author Bartłomiej Król
 */

const express = require('express');
const router = express.Router();
const doctorsController = require('../controllers/doctors.controller');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET /api/doctors - Get all doctors
router.get('/', doctorsController.getAll);

// GET /api/doctors/:id - Get doctor by ID
router.get('/:id', doctorsController.getById);

// GET /api/doctors/:id/schedule - Get doctor with working hours
router.get('/:id/schedule', doctorsController.getWithSchedule);

// GET /api/doctors/:id/appointments - Get doctor's appointments for a date
router.get('/:id/appointments', doctorsController.getAppointments);

// GET /api/doctors/:id/weekly - Get doctor's weekly schedule summary
router.get('/:id/weekly', doctorsController.getWeeklySchedule);

// GET /api/doctors/:id/availability - Check doctor availability at specific time
router.get('/:id/availability', doctorsController.checkAvailability);

module.exports = router;
