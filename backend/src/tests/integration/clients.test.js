const request = require('supertest');
const app = require('../../app');

// Mock Auth Middleware to bypass login
jest.mock('../../middleware/auth', () => ({
    authenticate: (req, res, next) => {
        req.user = { id: 1, role: 'receptionist' }; // Mock user
        next();
    }
}));

// Mock Service
jest.mock('../../services/clients.service', () => ({
    getAll: jest.fn().mockResolvedValue([{ id: 1, firstName: 'Jan' }]),
    getById: jest.fn().mockResolvedValue({ id: 1, firstName: 'Jan' }),
    create: jest.fn().mockResolvedValue({ id: 2 }),
    update: jest.fn().mockResolvedValue({ success: true })
}));

describe('Clients Integration Tests', () => {

    describe('GET /api/clients', () => {
        it('should return clients list', async () => {
            const res = await request(app).get('/api/clients');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('POST /api/clients', () => {
        it('should create client with valid data', async () => {
            const validData = {
                firstName: 'Anna',
                lastName: 'Nowak',
                phoneNumber: '123456789'
            };

            const res = await request(app).post('/api/clients').send(validData);
            expect(res.statusCode).toBe(201);
        });

        it('should return 400 for invalid data (Zod)', async () => {
            const invalidData = {
                firstName: 'A', // too short
                lastName: 'Nowak',
                phoneNumber: '123456789'
            };

            const res = await request(app).post('/api/clients').send(invalidData);
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toContain('Błąd walidacji');
        });
    });

    describe('PUT /api/clients/:id', () => {
        it('should update client', async () => {
            const res = await request(app)
                .put('/api/clients/1')
                .send({ firstName: 'Janusz', lastName: 'Kowalski', phoneNumber: '987654321' });
            expect(res.statusCode).toBe(200);
        });
    });
});
