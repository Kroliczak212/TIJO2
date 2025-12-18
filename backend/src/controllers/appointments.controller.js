/**
 * Appointments Controller
 * Handles HTTP requests for appointments
 */

const appointmentsService = require('../services/appointments.service');

class AppointmentsController {

    async getAll(req, res, next) {
        try {
            const { doctorId, clientId, status, date, limit, offset } = req.query;
            const result = await appointmentsService.getAll({
                doctorId: doctorId ? parseInt(doctorId) : undefined,
                clientId: clientId ? parseInt(clientId) : undefined,
                status,
                date,
                limit: limit ? parseInt(limit) : undefined,
                offset: offset ? parseInt(offset) : undefined
            });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getSlots(req, res, next) {
        try {
            const { doctorId, date } = req.query;

            if (!doctorId || !date) {
                // If Zod request query validation was added, this could be removed too. 
                // Keeping basic checks for query params if not covered by middleware yet.
                // But for reschedule (body), we can remove.
                return res.status(400).json({
                    error: 'doctorId i date są wymagane'
                });
            }

            const result = await appointmentsService.getAvailableSlots(parseInt(doctorId), date);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getCalendar(req, res, next) {
        try {
            const { startDate, endDate, doctorId } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    error: 'startDate i endDate są wymagane'
                });
            }

            const result = await appointmentsService.getCalendarView({
                startDate,
                endDate,
                doctorId: doctorId ? parseInt(doctorId) : undefined
            });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const appointment = await appointmentsService.getById(parseInt(req.params.id));
            res.json(appointment);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const appointment = await appointmentsService.create(req.body);
            res.status(201).json(appointment);
        } catch (error) {
            next(error);
        }
    }

    async cancel(req, res, next) {
        try {
            const result = await appointmentsService.cancel(parseInt(req.params.id));
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async reschedule(req, res, next) {
        try {
            const { scheduledAt } = req.body;



            const result = await appointmentsService.reschedule(parseInt(req.params.id), scheduledAt);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async complete(req, res, next) {
        try {
            const { notes } = req.body;
            const result = await appointmentsService.complete(parseInt(req.params.id), notes);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AppointmentsController();
