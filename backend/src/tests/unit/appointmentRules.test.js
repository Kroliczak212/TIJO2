const {
    getHoursUntilAppointment,
    getCancellationType,
    canReschedule,
    formatTimeRemaining
} = require('../../config/appointmentRules');

describe('Appointment Rules', () => {
    // Helper to get date relative to now in hours
    const getRelativeDate = (hours) => {
        const date = new Date();
        date.setHours(date.getHours() + hours);
        return date;
    };

    describe('getHoursUntilAppointment', () => {
        test('should return positive hours for future appointment', () => {
            const future = getRelativeDate(2);
            const hours = getHoursUntilAppointment(future);
            expect(hours).toBeCloseTo(2, 1);
        });

        test('should return negative hours for past appointment', () => {
            const past = getRelativeDate(-2);
            const hours = getHoursUntilAppointment(past);
            expect(hours).toBeCloseTo(-2, 1);
        });
    });

    describe('getCancellationType', () => {
        // Case 1: > 72h (Free)
        test('should allow free cancellation if > 72h before', () => {
            const date = getRelativeDate(75); // 75 hours from now
            const result = getCancellationType(date);
            expect(result).toEqual({
                type: 'free',
                allowed: true,
                fee: 0,
                message: 'Bezpłatne anulowanie'
            });
        });

        // Case 2: 48h - 72h (Warning)
        test('should give warning if between 48h and 72h', () => {
            const date = getRelativeDate(50); // 50 hours from now
            const result = getCancellationType(date);
            expect(result.type).toBe('warning');
            expect(result.allowed).toBe(true);
            expect(result.fee).toBe(0);
            expect(result.message).toBeDefined();
        });

        // Case 3: 24h - 48h (Paid 50 PLN)
        test('should require fee if between 24h and 48h', () => {
            const date = getRelativeDate(30); // 30 hours from now
            const result = getCancellationType(date);
            expect(result).toEqual({
                type: 'paid',
                allowed: true,
                fee: 50,
                message: 'Anulowanie płatne 50 zł (mniej niż 48h)'
            });
        });

        // Case 4: < 24h (Blocked)
        test('should block cancellation if < 24h', () => {
            const date = getRelativeDate(20); // 20 hours from now
            const result = getCancellationType(date);
            expect(result.allowed).toBe(false);
            expect(result.type).toBe('blocked');
        });

        // Case 5: Past (Blocked)
        test('should block cancellation for past appointments', () => {
            const date = getRelativeDate(-2); // 2 hours ago
            const result = getCancellationType(date);
            expect(result.allowed).toBe(false);
            expect(result.type).toBe('blocked');
        });
    });

    describe('canReschedule', () => {
        test('should allow rescheduling future appointment', () => {
            const date = getRelativeDate(5);
            const result = canReschedule(date);
            expect(result.allowed).toBe(true);
        });

        test('should block rescheduling past appointment', () => {
            const date = getRelativeDate(-2);
            const result = canReschedule(date);
            expect(result.allowed).toBe(false);
            expect(result.message).toBeDefined();
        });
    });

    describe('formatTimeRemaining', () => {
        test('should format days correctly', () => {
            expect(formatTimeRemaining(25)).toBe('1 dzień i 1 godzina');
        });

        test('should format hours correctly', () => {
            expect(formatTimeRemaining(2.5)).toBe('2 godzin i 30 minut');
        });

        test('should return simple string for past', () => {
            expect(formatTimeRemaining(-1)).toBe('Wizyta już się odbyła');
        });
    });
});
