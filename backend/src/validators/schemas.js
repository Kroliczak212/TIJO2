const { z } = require('zod');

const loginSchema = z.object({
    email: z.string().email('Nieprawidłowy format email'),
    password: z.string().min(1, 'Hasło jest wymagane')
});

const createAppointmentSchema = z.object({
    doctorId: z.number({ required_error: 'Lekarz jest wymagany' }).int().positive(),
    clientId: z.number({ required_error: 'Klient jest wymagany' }).int().positive(),
    petId: z.number({ required_error: 'Zwierzę jest wymagane' }).int().positive(),
    scheduledAt: z.string({ required_error: 'Data jest wymagana' }).refine((val) => !isNaN(Date.parse(val)), {
        message: "Nieprawidłowy format daty (ISO string wymagany)"
    }),
    type: z.string().min(1, 'Typ wizyty jest wymagany').default('wizyta'),
    notes: z.string().optional()
});

const rescheduleAppointmentSchema = z.object({
    scheduledAt: z.string({ required_error: 'Nowa data jest wymagana' }).refine((val) => !isNaN(Date.parse(val)), {
        message: "Nieprawidłowy format daty"
    })
});

const clientSchema = z.object({
    firstName: z.string().min(2, 'Imię musi mieć min. 2 znaki'),
    lastName: z.string().min(2, 'Nazwisko musi mieć min. 2 znaki'),
    email: z.string().email('Nieprawidłowy email').optional().or(z.literal('')),
    phoneNumber: z.string().regex(/^\d{9,15}$/, 'Nieprawidłowy numer telefonu'),
    address: z.string().optional()
});

const petSchema = z.object({
    name: z.string().min(1, 'Imię zwierzęcia jest wymagane'),
    species: z.string().min(1, 'Gatunek jest wymagany'),
    breed: z.string().optional(),
    birthDate: z.string().optional(),
    clientId: z.number().int().positive()
});

module.exports = {
    loginSchema,
    createAppointmentSchema,
    rescheduleAppointmentSchema,
    clientSchema,
    petSchema
};
