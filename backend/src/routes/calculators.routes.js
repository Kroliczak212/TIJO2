/**
 * Calculators Routes
 *
 * @author Bartłomiej Król
 */

const express = require('express');
const router = express.Router();
const calculatorsController = require('../controllers/calculators.controller');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// POST /api/calculators/pet-age - Calculate pet age
router.post('/pet-age', calculatorsController.calculatePetAge);

// POST /api/calculators/dosage - Calculate medication dosage
router.post('/dosage', calculatorsController.calculateDosage);

// POST /api/calculators/bmi - Calculate pet BMI/BCS
router.post('/bmi', calculatorsController.calculateBMI);

// GET /api/calculators/medications - Get available medications
router.get('/medications', calculatorsController.getMedications);

// GET /api/calculators/breeds - Get available breeds
router.get('/breeds', calculatorsController.getBreeds);

module.exports = router;
