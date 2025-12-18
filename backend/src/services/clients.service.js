/**
 * Clients Service
 *
 * Handles client management operations
 *
 * @author Bartłomiej Król
 */

const { query } = require('../config/database');

class ClientsService {
  /**
   * Get all clients with optional search
   * @param {Object} options - Search options
   * @returns {Promise<Object>} List of clients
   */
  async getAll(options = {}) {
    const { search, limit = 50, offset = 0 } = options;

    let sql = 'SELECT * FROM clients';
    const params = [];

    if (search) {
      sql += ` WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const limitVal = parseInt(limit) || 50;
    const offsetVal = parseInt(offset) || 0;

    sql += ` ORDER BY last_name, first_name LIMIT ${limitVal} OFFSET ${offsetVal}`;
    // params does not include limit/offset anymore

    const clients = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM clients';
    const countParams = [];
    if (search) {
      countSql += ` WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const countRows = await query(countSql, countParams);
    const total = countRows[0].total;

    return {
      data: clients,
      total,
      limit,
      offset
    };
  }

  /**
   * Get client by ID
   * @param {number} id - Client ID
   * @returns {Promise<Object>} Client data
   */
  async getById(id) {
    const rows = await query('SELECT * FROM clients WHERE id = ?', [id]);
    const client = rows[0];

    if (!client) {
      throw { statusCode: 404, message: 'Klient nie znaleziony' };
    }

    return client;
  }

  /**
   * Get client with their pets
   * @param {number} id - Client ID
   * @returns {Promise<Object>} Client data with pets
   */
  async getWithPets(id) {
    const client = await this.getById(id);

    const pets = await query(
      'SELECT * FROM pets WHERE client_id = ? ORDER BY name',
      [id]
    );

    return {
      ...client,
      pets
    };
  }

  /**
   * Get client appointment history
   * @param {number} clientId - Client ID
   * @returns {Promise<Array>} List of appointments
   */
  async getAppointmentHistory(clientId) {
    // Verify client exists
    await this.getById(clientId);

    const appointments = await query(`
      SELECT
        a.*,
        p.name as pet_name,
        CONCAT(d.first_name, ' ', d.last_name) as doctor_name
      FROM appointments a
      JOIN pets p ON a.pet_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.client_id = ?
      ORDER BY a.scheduled_at DESC
    `, [clientId]);

    return appointments;
  }

  /**
   * Create new client
   * @param {Object} data - Client data
   * @returns {Promise<Object>} Created client
   */
  async create(data) {
    const { firstName, lastName, email, phone, address, notes } = data;

    // Check if email already exists
    if (email) {
      const existingRows = await query('SELECT id FROM clients WHERE email = ?', [email]);
      if (existingRows[0]) {
        throw { statusCode: 409, message: 'Klient z tym adresem email już istnieje' };
      }
    }

    const result = await query(`
      INSERT INTO clients (first_name, last_name, email, phone, address, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [firstName, lastName, email || null, phone, address || null, notes || null]);

    return this.getById(result.insertId);
  }

  /**
   * Update client
   * @param {number} id - Client ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated client
   */
  async update(id, data) {
    // Verify client exists
    await this.getById(id);

    const { firstName, lastName, email, phone, address, notes } = data;

    // Check if email already exists for another client
    if (email) {
      const existingRows = await query('SELECT id FROM clients WHERE email = ? AND id != ?', [email, id]);
      if (existingRows[0]) {
        throw { statusCode: 409, message: 'Klient z tym adresem email już istnieje' };
      }
    }

    await query(`
      UPDATE clients
      SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, notes = ?
      WHERE id = ?
    `, [firstName, lastName, email || null, phone, address || null, notes || null, id]);

    return this.getById(id);
  }

  /**
   * Delete client
   * @param {number} id - Client ID
   */
  async delete(id) {
    // Verify client exists
    await this.getById(id);

    // Check for appointments
    const rows = await query(
      'SELECT COUNT(*) as count FROM appointments WHERE client_id = ?',
      [id]
    );

    if (rows[0].count > 0) {
      throw {
        statusCode: 400,
        message: 'Nie można usunąć klienta z historią wizyt'
      };
    }

    await query('DELETE FROM clients WHERE id = ?', [id]);

    return { message: 'Klient został usunięty' };
  }
}

module.exports = new ClientsService();
