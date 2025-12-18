/**
 * Pets Routes
 *
 * @author Bartłomiej Król
 */

const express = require('express');
const router = express.Router();
const petsController = require('../controllers/pets.controller');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET /api/pets - Get all pets
router.get('/', petsController.getAll);

// GET /api/pets/:id - Get pet by ID
router.get('/:id', petsController.getById);

// POST /api/pets - Create new pet
router.post('/', petsController.create);

// PUT /api/pets/:id - Update pet
router.put('/:id', petsController.update);

// GET /api/pets/:id/history - Get pet medical history
router.get('/:id/history', petsController.getMedicalHistory);

// GET /api/pets/:id/vaccinations - Get pet vaccinations
router.get('/:id/vaccinations', petsController.getVaccinations);

module.exports = router;
