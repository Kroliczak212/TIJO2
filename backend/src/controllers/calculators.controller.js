/**
 * Calculators Controller
 * Handles HTTP requests for calculators
 */

const calculatorsService = require('../services/calculators.service');

class CalculatorsController {

    async calculatePetAge(req, res, next) {
        try {
            const { species, ageYears, ageMonths } = req.body;

            if (!species || (ageYears === undefined && ageMonths === undefined)) {
                return res.status(400).json({
                    error: 'Gatunek i wiek (lata lub miesiące) są wymagane'
                });
            }

            const result = calculatorsService.calculatePetAge(species, ageYears || 0, ageMonths || 0);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async calculateDosage(req, res, next) {
        try {
            const { petId, weight, medicationId } = req.body;

            if ((!petId && !weight) || !medicationId) {
                return res.status(400).json({
                    error: 'Waga (lub ID zwierzęcia) i ID leku są wymagane'
                });
            }

            const result = await calculatorsService.calculateDosage({ petId, weight, medicationId });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async calculateBMI(req, res, next) {
        try {
            const { petId, weight, species, breed } = req.body;

            if ((!petId && (!weight || !species || !breed))) {
                return res.status(400).json({
                    error: 'Wymagane dane zwierzęcia'
                });
            }

            const result = await calculatorsService.calculateBMI({ petId, weight, species, breed });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
    async getMedications(req, res, next) {
        try {
            const { species } = req.query;
            const medications = await calculatorsService.getMedications(species);
            res.json(medications);
        } catch (error) {
            next(error);
        }
    }

    async getBreeds(req, res, next) {
        try {
            const { species } = req.query;
            const breeds = await calculatorsService.getBreeds(species);
            res.json(breeds);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CalculatorsController();
