/**
 * Doctors Service
 *
 * Handles doctor management and schedule operations
 *
 * @author Bartłomiej Król
 */

const { query } = require('../config/database');
const { AppointmentStatus } = require('../config/constants');

class DoctorsService {
  /**
   * Get all doctors
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} List of doctors
   */
  async getAll(options = {}) {
    const { activeOnly = true } = options;

    let sql = 'SELECT * FROM doctors';
    const params = [];

    if (activeOnly) {
      sql += ' WHERE is_active = 1';
    }

    sql += ' ORDER BY last_name, first_name';

    const doctors = await query(sql, params);
    return doctors;
  }

  /**
   * Get doctor by ID
   * @param {number} id - Doctor ID
   * @returns {Promise<Object>} Doctor data
   */
  async getById(id) {
    const rows = await query('SELECT * FROM doctors WHERE id = ?', [id]);
    const doctor = rows[0];

    if (!doctor) {
      throw { statusCode: 404, message: 'Lekarz nie znaleziony' };
    }

    return doctor;
  }

  /**
   * Get doctor with working hours
   * @param {number} id - Doctor ID
   * @returns {Promise<Object>} Doctor data with schedule
   */
  async getWithSchedule(id) {
    const doctor = await this.getById(id);

    const workingHours = await query(`
      SELECT day_of_week, start_time, end_time
      FROM working_hours
      WHERE doctor_id = ?
      ORDER BY FIELD(day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
    `, [id]);

    return {
      ...doctor,
      workingHours
    };
  }

  /**
   * Get doctor's appointments for a date
   * @param {number} doctorId - Doctor ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {Promise<Array>} List of appointments
   */
  async getAppointments(doctorId, date) {
    // Verify doctor exists
    await this.getById(doctorId);

    const appointments = await query(`
      SELECT
        a.*,
        p.name as pet_name,
        p.species as pet_species,
        CONCAT(c.first_name, ' ', c.last_name) as client_name,
        c.phone as client_phone
      FROM appointments a
      JOIN pets p ON a.pet_id = p.id
      JOIN clients c ON a.client_id = c.id
      WHERE a.doctor_id = ? AND DATE(a.scheduled_at) = ?
      ORDER BY a.scheduled_at ASC
    `, [doctorId, date]);

    return appointments;
  }

  /**
   * Get doctor's schedule summary for a week
   * @param {number} doctorId - Doctor ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @returns {Promise<Object>} Weekly schedule summary
   */
  async getWeeklySchedule(doctorId, startDate) {
    // Verify doctor exists
    const doctor = await this.getById(doctorId);

    // Get working hours
    const workingHours = await query(`
      SELECT day_of_week, start_time, end_time
      FROM working_hours
      WHERE doctor_id = ?
    `, [doctorId]);

    // Create working hours map
    const hoursMap = workingHours.reduce((acc, wh) => {
      acc[wh.day_of_week] = wh;
      return acc;
    }, {});

    // Calculate end date (7 days from start)
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(startDateObj.getDate() + 6);
    const endDate = endDateObj.toISOString().split('T')[0];

    // Get appointments count per day
    const appointmentCounts = await query(`
      SELECT
        DATE(scheduled_at) as date,
        COUNT(*) as count
      FROM appointments
      WHERE doctor_id = ?
        AND DATE(scheduled_at) BETWEEN ? AND ?
        AND status != ?
      GROUP BY DATE(scheduled_at)
    `, [doctorId, startDate, endDate, AppointmentStatus.CANCELLED]);

    // Create counts map
    const countsMap = appointmentCounts.reduce((acc, item) => {
      let dateStr;
      if (item.date instanceof Date) {
        dateStr = item.date.toISOString().split('T')[0];
      } else {
        dateStr = new Date(item.date).toISOString().split('T')[0];
      }
      acc[dateStr] = item.count;
      return acc;
    }, {});

    // Build schedule
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    // Use UTC for date matching to ensure consistency
    const schedule = [];

    for (let i = 0; i < 7; i++) {
      // Create date from YYYY-MM-DD implies UTC midnight
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      // Log for debugging
      const dayIndex = d.getDay();
      const dayName = daysOfWeek[dayIndex];
      console.log(`Debug Schedule: i=${i}, dateStr=${dateStr}, dayIndex=${dayIndex}, dayName=${dayName}, isWorking=${!!hoursMap[dayName]}`);

      const daySchedule = {
        date: dateStr,
        dayOfWeek: dayName,
        dayOfWeekPl: this.getDayNamePl(dayName),
        isWorking: !!hoursMap[dayName],
        workingHours: hoursMap[dayName] || null,
        appointmentCount: countsMap[dateStr] || 0
      };

      schedule.push(daySchedule);
    }

    return {
      doctor,
      startDate,
      endDate,
      schedule
    };
  }

  /**
   * Get Polish day name
   * @param {string} dayName - English day name
   * @returns {string} Polish day name
   */
  getDayNamePl(dayName) {
    const days = {
      monday: 'Poniedziałek',
      tuesday: 'Wtorek',
      wednesday: 'Środa',
      thursday: 'Czwartek',
      friday: 'Piątek',
      saturday: 'Sobota',
      sunday: 'Niedziela'
    };
    return days[dayName] || dayName;
  }

  /**
   * Check if doctor is available at specific time
   * @param {number} doctorId - Doctor ID
   * @param {string} dateTime - Date and time
   * @returns {Promise<Object>} Availability info
   */
  async checkAvailability(doctorId, dateTime) {
    const doctor = await this.getById(doctorId);

    const dateObj = new Date(dateTime);
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = daysOfWeek[dateObj.getDay()];
    const time = dateObj.toTimeString().slice(0, 5);

    // Check working hours
    const workingHoursRows = await query(`
      SELECT start_time, end_time
      FROM working_hours
      WHERE doctor_id = ? AND day_of_week = ?
    `, [doctorId, dayOfWeek]);

    const workingHours = workingHoursRows[0];

    if (!workingHours) {
      return {
        available: false,
        reason: 'Lekarz nie pracuje w tym dniu'
      };
    }

    // Check if time is within working hours
    if (time < workingHours.start_time || time >= workingHours.end_time) {
      return {
        available: false,
        reason: 'Poza godzinami pracy'
      };
    }

    // Check for existing appointments
    const existingAppointmentRows = await query(`
      SELECT id FROM appointments
      WHERE doctor_id = ?
        AND scheduled_at = ?
        AND status != ?
    `, [doctorId, dateTime, AppointmentStatus.CANCELLED]);

    if (existingAppointmentRows[0]) {
      return {
        available: false,
        reason: 'Termin jest już zajęty'
      };
    }

    return {
      available: true,
      doctor,
      workingHours
    };
  }

  /**
   * Get available slots for a specific date
   * @param {number} doctorId - Doctor ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {Promise<Array>} List of available slots
   */
  async getDailySlots(doctorId, date) {
    const doctor = await this.getById(doctorId);
    const dateObj = new Date(date);
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = daysOfWeek[dateObj.getDay()];

    // Get working hours
    const workingHoursRows = await query(`
      SELECT start_time, end_time
      FROM working_hours
      WHERE doctor_id = ? AND day_of_week = ?
    `, [doctorId, dayOfWeek]);

    const workingHours = workingHoursRows[0];

    if (!workingHours) {
      return [];
    }

    // Get appointments
    const appointments = await query(`
      SELECT scheduled_at, duration_minutes
      FROM appointments
      WHERE doctor_id = ?
        AND DATE(scheduled_at) = ?
        AND status != ?
    `, [doctorId, date, AppointmentStatus.CANCELLED]);

    // Generate slots
    const slots = [];
    const slotDuration = 30; // minutes

    // Parse times
    const [startHour, startMinute] = workingHours.start_time.split(':').map(Number);
    const [endHour, endMinute] = workingHours.end_time.split(':').map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    for (let time = startTime; time < endTime; time += slotDuration) {
      const currentHour = Math.floor(time / 60);
      const currentMinute = time % 60;
      const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

      // Check if slot is taken
      const isTaken = appointments.some(appt => {
        const apptDate = new Date(appt.scheduled_at);
        const apptTime = apptDate.getHours() * 60 + apptDate.getMinutes();
        const apptEnd = apptTime + appt.duration_minutes;

        return (time >= apptTime && time < apptEnd);
      });

      if (!isTaken) {
        slots.push(timeStr);
      }
    }

    return slots;
  }
}

module.exports = new DoctorsService();
