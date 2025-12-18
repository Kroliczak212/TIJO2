const { loginSchema, createAppointmentSchema, clientSchema } = require('../../validators/schemas');

describe('Zod Schemas Validation', () => {

    describe('loginSchema', () => {
        it('should validate correct email and password', () => {
            const data = { email: 'test@example.com', password: 'password123' };
            const result = loginSchema.safeParse(data);
            expect(result.success).toBe(true);
        });


        it('should fail on invalid email', () => {
            const data = { email: 'not-an-email', password: 'password123' };
            const result = loginSchema.safeParse(data);
            expect(result.success).toBe(false);
            expect(result.error.issues[0].message).toContain('Nieprawidłowy format email');
        });

        it('should fail on empty password', () => {
            const data = { email: 'test@example.com', password: '' };
            const result = loginSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
    });

    describe('createAppointmentSchema', () => {
        it('should validate correct appointment', () => {
            const data = {
                doctorId: 1,
                clientId: 1,
                petId: 1,
                scheduledAt: new Date().toISOString(),
                type: 'wizyta',
                notes: 'Test'
            };
            const result = createAppointmentSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('should fail if doctorId is missing', () => {
            const data = {
                clientId: 1,
                petId: 1,
                scheduledAt: new Date().toISOString()
            };
            const result = createAppointmentSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('should fail on invalid scheduledAt format', () => {
            const data = {
                doctorId: 1,
                clientId: 1,
                petId: 1,
                scheduledAt: 'monday'
            };
            const result = createAppointmentSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
    });

    describe('clientSchema', () => {
        it('should validate valid client', () => {
            const data = {
                firstName: 'Jan',
                lastName: 'Kowalski',
                phoneNumber: '123456789'
            };
            const result = clientSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('should fail if name is too short', () => {
            const data = {
                firstName: 'J',
                lastName: 'Kowalski',
                phoneNumber: '123456789'
            };
            const result = clientSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
    });
});
