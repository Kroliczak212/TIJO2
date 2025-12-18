/**
 * Appointments Routes
 *
 * @author Bartłomiej Król
 */

const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointments.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createAppointmentSchema, rescheduleAppointmentSchema } = require('../validators/schemas');

// All routes require authentication
router.use(authenticate);

// GET /api/appointments - Get all appointments
router.get('/', appointmentsController.getAll);

// GET /api/appointments/slots - Get available time slots
router.get('/slots', appointmentsController.getSlots);

// GET /api/appointments/calendar - Get appointments for calendar view
router.get('/calendar', appointmentsController.getCalendar);

// GET /api/appointments/:id - Get appointment by ID
router.get('/:id', appointmentsController.getById);

// POST /api/appointments - Create new appointment
// POST /api/appointments - Create new appointment
router.post('/', validate(createAppointmentSchema), appointmentsController.create);

// POST /api/appointments/:id/cancel - Cancel appointment
router.post('/:id/cancel', appointmentsController.cancel);

// DELETE /api/appointments/:id - Cancel appointment (alternative)
router.delete('/:id', appointmentsController.cancel);

// POST /api/appointments/:id/reschedule - Reschedule appointment
// POST /api/appointments/:id/reschedule - Reschedule appointment
router.post('/:id/reschedule', validate(rescheduleAppointmentSchema), appointmentsController.reschedule);

// POST /api/appointments/:id/complete - Mark appointment as completed
router.post('/:id/complete', appointmentsController.complete);

module.exports = router;
