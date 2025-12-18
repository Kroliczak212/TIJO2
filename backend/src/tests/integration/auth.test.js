const request = require('supertest');
const app = require('../../app');

// Mock Auth Service
jest.mock('../../services/auth.service', () => ({
    login: jest.fn((email, password) => {
        if (email === 'valid@test.com' && password === 'password') {
            return Promise.resolve({ token: 'fake-jwt-token', user: { id: 1, email } });
        }
        return Promise.reject({ statusCode: 401, message: 'Invalid credentials' });
    }),
    register: jest.fn().mockResolvedValue({ id: 1 }),
    getUserById: jest.fn().mockResolvedValue({ id: 1, email: 'test@test.com' })
}));

describe('Auth Integration Tests', () => {

    describe('POST /api/auth/login', () => {
        it('should return token for valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'valid@test.com', password: 'password' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
        });

        it('should return 401 for invalid credentials', async () => { // Mock service rejection
            // Note: The controller catches the error from service and passes it to next(error)
            // Ensure error handler returns 401
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'invalid@test.com', password: 'wrong' });

            expect(res.statusCode).toBe(401);
        });

        it('should return 400 for invalid input format (Zod)', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'not-an-email', password: 'password' });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toContain('Błąd walidacji');
        });

        it('should return 400 when missing fields', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'valid@test.com' }); // Missing password

            expect(res.statusCode).toBe(400);
        });
    });
});
