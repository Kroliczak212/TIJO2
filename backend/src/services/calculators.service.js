/**
 * Calculators Service
 *
 * Service layer for veterinary calculators
 *
 * @author Bartłomiej Król
 */

const { query } = require('../config/database');
const { calculateHumanAge, getLifeStage, getDogSizeCategory } = require('../utils/petAgeCalculator');
const { calculateDose, calculateTablets, getDosageWarnings, calculateDosingSchedule } = require('../utils/dosageCalculator');
const { calculatePetBcs, getHealthRecommendations } = require('../utils/petBmiCalculator');

class CalculatorsService {
  /**
   * Calculate pet age in human years
   * @param {string} species - Species
   * @param {number} ageYears - Age in years
   * @param {number} ageMonths - Age in months
   * @returns {Object} Age calculation result
   */
  calculatePetAge(species, ageYears, ageMonths = 0) {
    if (!species) {
      throw { statusCode: 400, message: 'Wymagane: gatunek' };
    }

    // Validate species - only dog and cat supported
    if (species !== 'dog' && species !== 'cat') {
      throw { statusCode: 400, message: 'Nieobsługiwany gatunek. Dostępne: dog, cat' };
    }

    // Calculate total age in years
    const totalAgeInYears = Number(ageYears) + (Number(ageMonths) / 12);

    if (isNaN(totalAgeInYears) || totalAgeInYears < 0) {
      throw { statusCode: 400, message: 'Nieprawidłowy wiek' };
    }

    // We don't have weight here, assuming medium for age calc if not provided
    // Ideally we should accept weight in this method too if strict accuracy is needed
    // adapting to existing signature or simple usage
    const weight = 15; // default stub

    const humanYears = calculateHumanAge(species, totalAgeInYears, weight);
    const sizeCategory = species === 'dog' ? getDogSizeCategory(weight) : null;
    const lifeStage = getLifeStage(species, totalAgeInYears, sizeCategory);

    // Get life stage description
    const lifeStageDescriptions = {
      puppy: species === 'cat' ? 'Kocię - okres intensywnego wzrostu' : 'Szczenię - okres intensywnego wzrostu',
      junior: 'Młody - dojrzewanie',
      adult: 'Dorosły - pełna dojrzałość',
      senior: 'Senior - początek starzenia',
      geriatric: 'Wiek podeszły - wymaga szczególnej opieki'
    };

    return {
      humanYears: Math.round(humanYears),
      lifeStage,
      description: lifeStageDescriptions[lifeStage] || 'Nieznany etap życia',
      sizeCategory
    };
  }

  /**
   * Calculate medication dosage
   * @param {Object} data - Dosage calculation data
   * @returns {Promise<Object>} Dosage result
   */
  async calculateDosage(data) {
    const { medicationId, weight, species, petAge } = data;

    if (!medicationId || !weight) {
      throw { statusCode: 400, message: 'Wymagane: ID leku i waga zwierzęcia' };
    }

    // Get medication from database
    const rows = await query('SELECT * FROM medications WHERE id = ?', [medicationId]);
    const medication = rows[0];

    if (!medication) {
      throw { statusCode: 404, message: 'Lek nie znaleziony' };
    }

    // Calculate dose
    const doseResult = calculateDose(medication, weight, species);

    if (!doseResult.success) {
      throw { statusCode: 400, message: doseResult.error };
    }

    // Add additional warnings
    const additionalWarnings = getDosageWarnings(medication, weight, species, petAge);
    const allWarnings = [...(doseResult.warnings || []), ...additionalWarnings];

    // Return formatted response
    return {
      calculatedDose: doseResult.dose,
      unit: medication.unit,
      medication: medication.name,
      warning: allWarnings.length > 0 ? allWarnings.join('; ') : undefined,
      formula: doseResult.formula,
      maxDoseApplied: doseResult.maxDoseApplied
    };
  }

  /**
   * Calculate pet BMI/BCS
   * @param {Object} data - Pet data
   * @returns {Promise<Object>} BCS calculation result
   */
  async calculateBMI(data) {
    const { species, breed, weight } = data;

    if (!species || weight === undefined || weight === null) {
      throw { statusCode: 400, message: 'Wymagane: gatunek i waga' };
    }

    // Validate weight
    if (weight <= 0 || isNaN(weight)) {
      throw { statusCode: 400, message: 'Waga musi być liczbą dodatnią' };
    }

    // Try to get breed data from database
    let breedData = null;
    if (breed) {
      const rows = await query(
        'SELECT * FROM breed_weights WHERE species = ? AND breed = ?',
        [species, breed]
      );
      breedData = rows[0];
    }

    const result = calculatePetBcs(species, breed, weight, breedData);

    if (!result.success) {
      throw { statusCode: 400, message: result.error };
    }

    // Calculate weight difference
    const weightDifference = weight - result.idealWeight;

    // Get health recommendations
    const recommendations = getHealthRecommendations(result.bcs);

    // Format response
    return {
      bcs: result.bcs,
      category: result.category,
      categoryDescription: result.categoryDescription,
      idealWeight: result.idealWeight,
      weightDifference: Math.round(weightDifference * 10) / 10,
      recommendations: recommendations,
      estimatedIdeal: !breedData ? true : undefined
    };
  }

  /**
   * Get available medications
   * @param {string} species - Filter by species (optional)
   * @returns {Promise<Array>} List of medications
   */
  async getMedications(species = null) {
    let sql = 'SELECT * FROM medications';
    const params = [];

    if (species) {
      sql += ' WHERE species = ? OR species = ?';
      params.push(species, 'all');
    }

    sql += ' ORDER BY name';

    return await query(sql, params);
  }

  /**
   * Get available breeds with weight data
   * @param {string} species - Filter by species
   * @returns {Promise<Array>} List of breeds
   */
  async getBreeds(species) {
    if (!species) {
      throw { statusCode: 400, message: 'Wymagany: gatunek' };
    }

    const breeds = await query(`
      SELECT breed, ideal_weight, min_weight, max_weight, size_category
      FROM breed_weights
      WHERE species = ?
      ORDER BY breed
    `, [species]);

    return breeds;
  }
}

module.exports = new CalculatorsService();
