const request = require('supertest');
const app = require('../../app');

// Mock Auth Middleware to bypass login
jest.mock('../../middleware/auth', () => ({
    authenticate: (req, res, next) => {
        req.user = { id: 1, role: 'receptionist' }; // Mock user
        next();
    }
}));

// Mock Database Service to avoid real DB calls
jest.mock('../../services/appointments.service', () => ({
    getAll: jest.fn().mockResolvedValue([]),
    getById: jest.fn().mockReturnValue({ id: 1, date: '2023-01-01' }),
    create: jest.fn().mockResolvedValue({ id: 2, status: 'scheduled' }),
    cancel: jest.fn().mockResolvedValue({ success: true }),
    reschedule: jest.fn().mockResolvedValue({ success: true, date: '2023-01-02' }),
    getAvailableSlots: jest.fn().mockResolvedValue(['10:00', '10:30'])
}));

describe('Appointments Integration Tests', () => {

    describe('GET /api/appointments', () => {
        it('should return list of appointments', async () => {
            const res = await request(app).get('/api/appointments');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('POST /api/appointments', () => {
        it('should create appointment when data is valid', async () => {
            const validData = {
                doctorId: 1,
                clientId: 1,
                petId: 1,
                scheduledAt: new Date().toISOString(),
                type: 'wizyta',
            };

            const res = await request(app).post('/api/appointments').send(validData);
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('id');
        });

        it('should return 400 when date is invalid (Zod)', async () => {
            const invalidData = {
                clientId: 1,
                petId: 1,
                doctorId: 1,
                scheduledAt: 'invalid-date-format'
            };

            const res = await request(app).post('/api/appointments').send(invalidData);
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toContain('Błąd walidacji');
        });
    });

    describe('POST /api/appointments/:id/reschedule', () => {
        it('should reschedule with valid date', async () => {
            const res = await request(app)
                .post('/api/appointments/1/reschedule')
                .send({ scheduledAt: new Date().toISOString() });

            expect(res.statusCode).toBe(200);
        });

        it('should fail with invalid date format', async () => {
            const res = await request(app)
                .post('/api/appointments/1/reschedule')
                .send({ scheduledAt: 'jutro' });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toContain('Błąd walidacji');
        });
    });

});
