/**
 * VetCRM Receptionist Module - API Service
 *
 * @author Bartłomiej Król
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile')
};

// Clients
export const clientsService = {
  getAll: (params?: { search?: string }) => api.get('/clients', { params }),
  getById: (id: number) => api.get(`/clients/${id}`),
  create: (data: { firstName: string; lastName: string; email?: string; phone: string; address?: string }) =>
    api.post('/clients', data),
  update: (id: number, data: { firstName?: string; lastName?: string; email?: string; phone?: string; address?: string }) =>
    api.put(`/clients/${id}`, data),
  delete: (id: number) => api.delete(`/clients/${id}`)
};

// Pets
export const petsService = {
  getAll: (params?: { clientId?: number }) => api.get('/pets', { params }),
  getById: (id: number) => api.get(`/pets/${id}`),
  create: (data: { clientId: number; name: string; species: string; breed?: string; dateOfBirth?: string; weight?: number; sex?: string; color?: string; microchipId?: string; notes?: string }) =>
    api.post('/pets', data),
  update: (id: number, data: { name?: string; species?: string; breed?: string; dateOfBirth?: string; weight?: number; sex?: string; color?: string; microchipId?: string; notes?: string }) =>
    api.put(`/pets/${id}`, data),
  getVaccinations: (id: number) => api.get(`/pets/${id}/vaccinations`)
};

// Appointments
export const appointmentsService = {
  getAll: (params?: { date?: string; doctorId?: number; status?: string }) =>
    api.get('/appointments', { params }),
  getById: (id: number) => api.get(`/appointments/${id}`),
  create: (data: { clientId: number; petId: number; doctorId: number; scheduledAt: string; reason?: string; duration?: number }) =>
    api.post('/appointments', data),
  update: (id: number, data: { scheduledAt?: string; reason?: string; status?: string }) =>
    api.put(`/appointments/${id}`, data),
  cancel: (id: number) => api.delete(`/appointments/${id}`),
  getSlots: (params: { doctorId: number; date: string }) =>
    api.get('/appointments/slots', { params })
};

// Doctors
export const doctorsService = {
  getAll: () => api.get('/doctors'),
  getById: (id: number) => api.get(`/doctors/${id}`),
  getSchedule: (id: number) => api.get(`/doctors/${id}/schedule`),
  getAvailability: (id: number, date: string) =>
    api.get(`/doctors/${id}/availability`, { params: { date } })
};

// Calculators
export const calculatorsService = {
  calculatePetAge: (data: { species: string; ageYears: number; ageMonths?: number; breed?: string; weight?: number }) =>
    api.post('/calculators/pet-age', data),
  calculateDosage: (data: { medicationId: number; weight: number; species: string }) =>
    api.post('/calculators/dosage', data),
  calculateBmi: (data: { species: string; breed?: string; weight: number }) =>
    api.post('/calculators/bmi', data),
  getMedications: () => api.get('/calculators/medications'),
  getBreeds: (species: string) => api.get('/calculators/breeds', { params: { species } })
};

export default api;
