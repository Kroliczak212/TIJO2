/**
 * Global Constants
 */

const AppointmentStatus = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
};

const UserRole = {
  RECEPTIONIST: 'receptionist',
  ADMIN: 'admin'
};

const CancellationType = {
  FREE: 'free',
  PAID: 'paid',
  NOT_ALLOWED: 'not_allowed'
};

const Species = {
  DOG: 'dog',
  CAT: 'cat',
  RABBIT: 'rabbit',
  HAMSTER: 'hamster',
  BIRD: 'bird',
  OTHER: 'other'
};

module.exports = {
  AppointmentStatus,
  UserRole,
  CancellationType,
  Species
};
