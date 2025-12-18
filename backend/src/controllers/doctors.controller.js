/**
 * Doctors Controller
 * Handles HTTP requests for doctors
 */

const doctorsService = require('../services/doctors.service');

class DoctorsController {

    async getAll(req, res, next) {
        try {
            const { activeOnly } = req.query;
            const doctors = await doctorsService.getAll({
                activeOnly: activeOnly !== 'false'
            });
            res.json(doctors);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const doctor = await doctorsService.getById(parseInt(req.params.id));
            res.json(doctor);
        } catch (error) {
            next(error);
        }
    }

    async getWithSchedule(req, res, next) {
        try {
            const result = await doctorsService.getWithSchedule(parseInt(req.params.id));
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getAppointments(req, res, next) {
        try {
            const { date } = req.query;

            if (!date) {
                return res.status(400).json({
                    error: 'date jest wymagane'
                });
            }

            const appointments = await doctorsService.getAppointments(parseInt(req.params.id), date);
            res.json(appointments);
        } catch (error) {
            next(error);
        }
    }

    async getWeeklySchedule(req, res, next) {
        try {
            const { startDate } = req.query;

            if (!startDate) {
                return res.status(400).json({
                    error: 'startDate jest wymagane'
                });
            }

            const schedule = await doctorsService.getWeeklySchedule(parseInt(req.params.id), startDate);
            res.json(schedule);
        } catch (error) {
            next(error);
        }
    }

    async checkAvailability(req, res, next) {
        try {
            const { dateTime, date } = req.query;

            // If date is provided, return available slots for that date
            if (date && !dateTime) {
                const slots = await doctorsService.getDailySlots(parseInt(req.params.id), date);
                return res.json(slots);
            }

            if (!dateTime) {
                return res.status(400).json({
                    error: 'dateTime lub date jest wymagane'
                });
            }

            const availability = await doctorsService.checkAvailability(parseInt(req.params.id), dateTime);
            return res.json(availability);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DoctorsController();
