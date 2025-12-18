/**
 * Appointments Service
 *
 * Handles appointment management operations
 *
 * @author Bartłomiej Król
 */

const { query } = require('../config/database');
const {
  APPOINTMENT_RULES,
  getHoursUntilAppointment,
  getCancellationType,
  canReschedule,
  formatTimeRemaining
} = require('../config/appointmentRules');
const { AppointmentStatus } = require('../config/constants');

class AppointmentsService {
  /**
   * Get all appointments with filters
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} List of appointments and pagination meta
   */
  async getAll(options = {}) {
    const { doctorId, clientId, status, date, limit = 50, offset = 0 } = options;

    let sql = `
      SELECT
        a.*,
        p.name as pet_name,
        p.species as pet_species,
        CONCAT(c.first_name, ' ', c.last_name) as client_name,
        c.phone as client_phone,
        CONCAT(d.first_name, ' ', d.last_name) as doctor_name
      FROM appointments a
      JOIN pets p ON a.pet_id = p.id
      JOIN clients c ON a.client_id = c.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (doctorId) {
      sql += ' AND a.doctor_id = ?';
      params.push(doctorId);
    }

    if (clientId) {
      sql += ' AND a.client_id = ?';
      params.push(clientId);
    }

    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    if (date) {
      sql += ' AND DATE(a.scheduled_at) = ?';
      params.push(date);
    }

    const limitVal = parseInt(limit) || 50;
    const offsetVal = parseInt(offset) || 0;

    sql += ` ORDER BY a.scheduled_at ASC LIMIT ${limitVal} OFFSET ${offsetVal}`;
    // params does not include limit/offset anymore

    const appointments = await query(sql, params);

    // Enrich with time info
    const enrichedAppointments = appointments.map(apt => ({
      ...apt,
      hoursUntil: getHoursUntilAppointment(apt.scheduled_at),
      timeRemaining: formatTimeRemaining(getHoursUntilAppointment(apt.scheduled_at)),
      cancellation: getCancellationType(apt.scheduled_at),
      reschedule: canReschedule(apt.scheduled_at)
    }));

    return {
      data: enrichedAppointments,
      limit,
      offset
    };
  }

  /**
   * Get appointment by ID
   * @param {number} id - Appointment ID
   * @returns {Promise<Object>} Appointment data
   */
  async getById(id) {
    const rows = await query(`
      SELECT
        a.*,
        p.name as pet_name,
        p.species as pet_species,
        p.breed as pet_breed,
        CONCAT(c.first_name, ' ', c.last_name) as client_name,
        c.phone as client_phone,
        c.email as client_email,
        CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
        d.specialization as doctor_specialization
      FROM appointments a
      JOIN pets p ON a.pet_id = p.id
      JOIN clients c ON a.client_id = c.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = ?
    `, [id]);

    const appointment = rows[0];

    if (!appointment) {
      throw { statusCode: 404, message: 'Wizyta nie znaleziona' };
    }

    // Add time info
    appointment.hoursUntil = getHoursUntilAppointment(appointment.scheduled_at);
    appointment.timeRemaining = formatTimeRemaining(appointment.hoursUntil);
    appointment.cancellation = getCancellationType(appointment.scheduled_at);
    appointment.reschedule = canReschedule(appointment.scheduled_at);

    return appointment;
  }

  /**
   * Get available time slots for a doctor on a date
   * @param {number} doctorId - Doctor ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {Promise<Object>} Available slots
   */
  async getAvailableSlots(doctorId, date) {
    // Get day of week
    const dateObj = new Date(date);
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = daysOfWeek[dateObj.getDay()];

    // Get working hours
    const rows = await query(`
      SELECT start_time, end_time
      FROM working_hours
      WHERE doctor_id = ? AND day_of_week = ?
    `, [doctorId, dayOfWeek]);

    const workingHours = rows[0];

    if (!workingHours) {
      return { slots: [], message: 'Lekarz nie pracuje w tym dniu' };
    }

    // Get existing appointments
    const existingAppointments = await query(`
      SELECT scheduled_at, duration_minutes
      FROM appointments
      WHERE doctor_id = ? AND DATE(scheduled_at) = ? AND status != ?
    `, [doctorId, date, AppointmentStatus.CANCELLED]);

    // Generate slots
    const slots = [];
    const [startHour, startMin] = workingHours.start_time.split(':').map(Number);
    const [endHour, endMin] = workingHours.end_time.split(':').map(Number);

    const slotInterval = APPOINTMENT_RULES.SLOT_INTERVAL_MINUTES;

    let currentTime = new Date(date);
    currentTime.setHours(startHour, startMin, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, endMin, 0, 0);

    while (currentTime < endTime) {
      const timeStr = currentTime.toTimeString().slice(0, 5);
      const slotDateTime = `${date} ${timeStr}`;

      // Check if slot is taken
      const isTaken = existingAppointments.some(apt => {
        const aptTime = new Date(apt.scheduled_at);
        const aptEndTime = new Date(aptTime.getTime() + apt.duration_minutes * 60 * 1000);
        return currentTime >= aptTime && currentTime < aptEndTime;
      });

      // Check if slot is in the past
      const now = new Date();
      const slotDate = new Date(`${date}T${timeStr}`);
      const isPast = slotDate < now;

      slots.push({
        time: timeStr,
        datetime: slotDateTime,
        available: !isTaken && !isPast,
        isPast
      });

      currentTime.setMinutes(currentTime.getMinutes() + slotInterval);
    }

    return { slots, workingHours };
  }

  /**
   * Create new appointment
   * @param {Object} data - Appointment data
   * @returns {Promise<Object>} Created appointment
   */
  async create(data) {
    const { clientId, petId, doctorId, scheduledAt, reason, notes, durationMinutes } = data;

    // Verify pet belongs to client
    const petRows = await query('SELECT * FROM pets WHERE id = ? AND client_id = ?', [petId, clientId]);
    if (!petRows[0]) {
      throw { statusCode: 400, message: 'Zwierzę nie należy do tego klienta' };
    }

    // Verify doctor exists
    const doctorRows = await query('SELECT * FROM doctors WHERE id = ? AND is_active = 1', [doctorId]);
    if (!doctorRows[0]) {
      throw { statusCode: 400, message: 'Lekarz nie znaleziony lub nieaktywny' };
    }

    // Double-check slot availability (backend validation)
    // Note: The Unique Constraint in DB is the final guard, but this gives a nicer error message
    // before hitting the database lock if we can catch it.

    // Create appointment
    const duration = durationMinutes || APPOINTMENT_RULES.DEFAULT_DURATION_MINUTES;

    try {
      const result = await query(`
        INSERT INTO appointments (client_id, pet_id, doctor_id, scheduled_at, duration_minutes, reason, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [clientId, petId, doctorId, scheduledAt, duration, reason || null, notes || null, AppointmentStatus.SCHEDULED]);

      return this.getById(result.insertId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw { statusCode: 409, message: 'Ten termin jest już zajęty przez innego pacjenta (Double Booking prevented)' };
      }
      throw error;
    }
  }

  /**
   * Cancel appointment
   * @param {number} id - Appointment ID
   * @returns {Promise<Object>} Cancelled appointment
   */
  async cancel(id) {
    const appointment = await this.getById(id);

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw { statusCode: 400, message: 'Wizyta jest już anulowana' };
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw { statusCode: 400, message: 'Nie można anulować zakończonej wizyty' };
    }

    const cancellation = getCancellationType(appointment.scheduled_at);

    if (!cancellation.allowed) {
      throw { statusCode: 400, message: cancellation.message };
    }

    await query(`
      UPDATE appointments
      SET status = ?, cancelled_at = CURRENT_TIMESTAMP, cancellation_fee = ?
      WHERE id = ?
    `, [AppointmentStatus.CANCELLED, cancellation.fee, id]);

    return {
      ...(await this.getById(id)),
      hasFee: cancellation.fee > 0,
      fee: cancellation.fee
    };
  }

  /**
   * Reschedule appointment
   * @param {number} id - Appointment ID
   * @param {string} newScheduledAt - New date/time
   * @returns {Promise<Object>} Rescheduled appointment
   */
  async reschedule(id, newScheduledAt) {
    const appointment = await this.getById(id);

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw { statusCode: 400, message: 'Można przesunąć tylko zaplanowane wizyty' };
    }

    const rescheduleInfo = canReschedule(appointment.scheduled_at);

    if (!rescheduleInfo.allowed) {
      throw { statusCode: 400, message: rescheduleInfo.message };
    }

    // Attempt update
    try {
      await query(`
        UPDATE appointments
        SET scheduled_at = ?, notes = CONCAT(COALESCE(notes, ''), ' [Przesunięto z: ', ?, ']')
        WHERE id = ?
      `, [newScheduledAt, appointment.scheduled_at, id]);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw { statusCode: 409, message: 'Nowy termin jest już zajęty' };
      }
      throw error;
    }

    return this.getById(id);
  }

  /**
   * Complete appointment
   * @param {number} id - Appointment ID
   * @param {string} notes - Completion notes
   * @returns {Promise<Object>} Completed appointment
   */
  async complete(id, notes = null) {
    const appointment = await this.getById(id);

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw { statusCode: 400, message: 'Można zakończyć tylko zaplanowane wizyty' };
    }

    await query(`
      UPDATE appointments
      SET status = ?, notes = CASE WHEN ? IS NOT NULL THEN ? ELSE notes END
      WHERE id = ?
    `, [AppointmentStatus.COMPLETED, notes, notes, id]);

    return this.getById(id);
  }

  /**
   * Get appointments for calendar view
   * @param {Object} options - Date range options
   * @returns {Promise<Object>} Appointments grouped by date
   */
  async getCalendarView(options = {}) {
    const { startDate, endDate, doctorId } = options;

    let sql = `
      SELECT
        a.*,
        p.name as pet_name,
        CONCAT(c.first_name, ' ', c.last_name) as client_name,
        CONCAT(d.first_name, ' ', d.last_name) as doctor_name
      FROM appointments a
      JOIN pets p ON a.pet_id = p.id
      JOIN clients c ON a.client_id = c.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE DATE(a.scheduled_at) BETWEEN ? AND ?
    `;
    const params = [startDate, endDate];

    if (doctorId) {
      sql += ' AND a.doctor_id = ?';
      params.push(doctorId);
    }

    sql += ' ORDER BY a.scheduled_at ASC';

    const appointments = await query(sql, params);

    // Group by date
    const grouped = appointments.reduce((acc, apt) => {
      // Handle Date object or string from DB
      let dateStr;
      if (apt.scheduled_at instanceof Date) {
        dateStr = apt.scheduled_at.toISOString().split('T')[0];
      } else {
        dateStr = apt.scheduled_at.toString().split(' ')[0] || apt.scheduled_at.toString().split('T')[0];
      }

      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(apt);
      return acc;
    }, {});

    return grouped;
  }
}

module.exports = new AppointmentsService();
