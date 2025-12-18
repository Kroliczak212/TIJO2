/**
 * Appointment Business Rules Configuration
 *
 * Simplified rules for VetCRM.
 *
 * @author Bartłomiej Król
 */

const APPOINTMENT_RULES = {
  // Simple thresholds
  MIN_NOTICE_HOURS: 1, // Minimum 1h notice for online changes

  // Appointment duration
  DEFAULT_DURATION_MINUTES: 30,
  MIN_DURATION_MINUTES: 15,
  MAX_DURATION_MINUTES: 120,

  // Slot configuration
  SLOT_INTERVAL_MINUTES: 30
};

/**
 * Calculate hours until appointment
 * @param {Date|string} appointmentDate - Appointment date/time
 * @returns {number} Hours until appointment (negative if past)
 */
function getHoursUntilAppointment(appointmentDate) {
  const now = new Date();
  const appointment = new Date(appointmentDate);
  const diffMs = appointment.getTime() - now.getTime();
  return diffMs / (1000 * 60 * 60);
}

/**
 * Determine cancellation type
 * @param {Date|string} appointmentDate - Appointment date/time
 * @returns {Object} Cancellation type info
 */
function getCancellationType(appointmentDate) {
  const hoursUntil = getHoursUntilAppointment(appointmentDate);

  if (hoursUntil < 24) {
    return {
      type: 'blocked',
      allowed: false,
      message: 'Zbyt późno na anulowanie wizyty (mniej niż 24h)'
    };
  }

  if (hoursUntil < 48) {
    return {
      type: 'paid',
      allowed: true,
      fee: 50,
      message: 'Anulowanie płatne 50 zł (mniej niż 48h)'
    };
  }

  if (hoursUntil < 72) {
    return {
      type: 'warning',
      allowed: true,
      fee: 0,
      message: 'Uwaga: Anulujesz wizytę w ostatniej chwili'
    };
  }

  // Allow cancellation if it's in the future > 72h
  return {
    type: 'free',
    allowed: true,
    fee: 0,
    message: 'Bezpłatne anulowanie'
  };
}

/**
 * Check if appointment can be rescheduled
 * @param {Date|string} appointmentDate - Appointment date/time
 * @returns {Object} Reschedule info
 */
function canReschedule(appointmentDate) {
  const hoursUntil = getHoursUntilAppointment(appointmentDate);

  if (hoursUntil < 0) {
    return {
      allowed: false,
      message: 'Nie można przesunąć wizyty, która już się odbyła'
    };
  }

  return {
    allowed: true,
    requiresApproval: false,
    message: 'Przesunięcie możliwe'
  };
}

/**
 * Format time remaining until appointment
 * @param {number} hours - Hours until appointment
 * @returns {string} Formatted time string
 */
function formatTimeRemaining(hours) {
  if (hours < 0) {
    return 'Wizyta już się odbyła';
  }

  if (hours === 0) {
    return '0 minut';
  }

  const days = Math.floor(hours / 24);
  const remainingHours = Math.floor(hours % 24);
  const minutes = Math.round((hours % 1) * 60);

  const parts = [];

  if (days > 0) {
    parts.push(`${days} ${days === 1 ? 'dzień' : 'dni'}`);
  }

  if (remainingHours > 0) {
    parts.push(`${remainingHours} ${remainingHours === 1 ? 'godzina' : 'godzin'}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} minut`);
  }

  return parts.join(' i ');
}

module.exports = {
  APPOINTMENT_RULES,
  getHoursUntilAppointment,
  getCancellationType,
  canReschedule,
  formatTimeRemaining
};
