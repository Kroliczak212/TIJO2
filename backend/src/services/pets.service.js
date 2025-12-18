/**
 * Pets Service
 *
 * Handles pet management operations
 *
 * @author Bartłomiej Król
 */

const { query } = require('../config/database');
const { getPetAgeInfo } = require('../utils/petAgeCalculator');
const { calculatePetBcs } = require('../utils/petBmiCalculator');

class PetsService {
  /**
   * Get all pets with optional filters
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} List of pets
   */
  async getAll(options = {}) {
    const { clientId, species, search, limit = 50, offset = 0 } = options;

    let sql = `
      SELECT p.*, CONCAT(c.first_name, ' ', c.last_name) as owner_name
      FROM pets p
      JOIN clients c ON p.client_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (clientId) {
      sql += ' AND p.client_id = ?';
      params.push(clientId);
    }

    if (species) {
      sql += ' AND p.species = ?';
      params.push(species);
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.breed LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const limitVal = parseInt(limit) || 50;
    const offsetVal = parseInt(offset) || 0;

    sql += ` ORDER BY p.name LIMIT ${limitVal} OFFSET ${offsetVal}`;
    // params does not include limit/offset anymore

    const pets = await query(sql, params);

    // Enrich with age info
    const enrichedPets = pets.map(pet => ({
      ...pet,
      ageInfo: getPetAgeInfo(pet.species, pet.date_of_birth, pet.weight)
    }));

    return {
      data: enrichedPets,
      limit,
      offset
    };
  }

  /**
   * Get pet by ID
   * @param {number} id - Pet ID
   * @returns {Promise<Object>} Pet data
   */
  async getById(id) {
    const rows = await query(`
      SELECT p.*, CONCAT(c.first_name, ' ', c.last_name) as owner_name
      FROM pets p
      JOIN clients c ON p.client_id = c.id
      WHERE p.id = ?
    `, [id]);

    const pet = rows[0];

    if (!pet) {
      throw { statusCode: 404, message: 'Zwierzę nie znalezione' };
    }

    // Add age info
    pet.ageInfo = getPetAgeInfo(pet.species, pet.date_of_birth, pet.weight);

    // Get breed data for BCS
    const breedRows = await query(
      'SELECT * FROM breed_weights WHERE species = ? AND breed = ?',
      [pet.species, pet.breed]
    );

    if (pet.weight) {
      pet.bcsInfo = calculatePetBcs(pet.species, pet.breed, pet.weight, breedRows[0]);
    }

    return pet;
  }

  /**
   * Get pet with vaccinations
   * @param {number} id - Pet ID
   * @returns {Promise<Object>} Pet data with vaccinations
   */
  async getWithVaccinations(id) {
    const pet = await this.getById(id);

    const vaccinations = await query(`
      SELECT * FROM vaccinations
      WHERE pet_id = ?
      ORDER BY vaccination_date DESC
    `, [id]);

    // Add status to vaccinations
    const enrichedVaccinations = vaccinations.map(vac => ({
      ...vac,
      status: this.getVaccinationStatus(vac.next_due_date)
    }));

    return {
      ...pet,
      vaccinations: enrichedVaccinations
    };
  }

  /**
   * Get vaccination status based on due date
   * @param {string} nextDueDate - Next due date
   * @returns {string} Status
   */
  getVaccinationStatus(nextDueDate) {
    if (!nextDueDate) return null;

    const now = new Date();
    const dueDate = new Date(nextDueDate);
    const diffDays = (dueDate - now) / (1000 * 60 * 60 * 24);

    if (diffDays < 0) return 'overdue';
    if (diffDays <= 30) return 'due_soon';
    return 'current';
  }

  /**
   * Create new pet
   * @param {Object} data - Pet data
   * @returns {Promise<Object>} Created pet
   */
  async create(data) {
    const { clientId, name, species, breed, dateOfBirth, weight, sex, color, microchipId, notes } = data;

    // Verify client exists
    const clientRows = await query('SELECT id FROM clients WHERE id = ?', [clientId]);
    if (!clientRows[0]) {
      throw { statusCode: 404, message: 'Klient nie znaleziony' };
    }

    const result = await query(`
      INSERT INTO pets (client_id, name, species, breed, date_of_birth, weight, sex, color, microchip_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [clientId, name, species, breed || null, dateOfBirth || null, weight || null, sex || 'unknown', color || null, microchipId || null, notes || null]);

    return this.getById(result.insertId);
  }

  /**
   * Update pet
   * @param {number} id - Pet ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated pet
   */
  async update(id, data) {
    // Verify pet exists
    await this.getById(id);

    const { name, species, breed, dateOfBirth, weight, sex, color, microchipId, notes } = data;

    await query(`
      UPDATE pets
      SET name = ?, species = ?, breed = ?, date_of_birth = ?, weight = ?, sex = ?, color = ?, microchip_id = ?, notes = ?
      WHERE id = ?
    `, [name, species, breed || null, dateOfBirth || null, weight || null, sex || 'unknown', color || null, microchipId || null, notes || null, id]);

    return this.getById(id);
  }

  /**
   * Delete pet
   * @param {number} id - Pet ID
   */
  async delete(id) {
    // Verify pet exists
    await this.getById(id);

    // Check for appointments
    const rows = await query(
      'SELECT COUNT(*) as count FROM appointments WHERE pet_id = ?',
      [id]
    );

    if (rows[0].count > 0) {
      throw {
        statusCode: 400,
        message: 'Nie można usunąć zwierzęcia z historią wizyt'
      };
    }

    await query('DELETE FROM pets WHERE id = ?', [id]);

    return { message: 'Zwierzę zostało usunięte' };
  }

  /**
   * Get available breeds for species
   * @param {string} species - Species
   * @returns {Promise<Array>} List of breeds
   */
  async getBreeds(species) {
    const breeds = await query(
      'SELECT DISTINCT breed FROM breed_weights WHERE species = ? ORDER BY breed',
      [species]
    );

    return breeds.map(b => b.breed);
  }
}

module.exports = new PetsService();
