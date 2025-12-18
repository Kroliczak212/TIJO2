/**
 * Clients Routes
 *
 * @author Bartłomiej Król
 */

const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/clients.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { clientSchema } = require('../validators/schemas');

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Zarządzanie klientami
 */

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Pobierz listę klientów
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Wyszukaj po imieniu/nazwisku/telefonie
 *     responses:
 *       200:
 *         description: Lista klientów
 *       401:
 *         description: Brak autoryzacji
 */
router.get('/', clientsController.getAll);

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     summary: Pobierz klienta po ID
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dane klienta
 *       404:
 *         description: Klient nie znaleziony
 */
router.get('/:id', clientsController.getById);

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Utwórz nowego klienta
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - phone
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Klient utworzony
 *       400:
 *         description: Błąd walidacji
 */
router.post('/', validate(clientSchema), clientsController.create);

/**
 * @swagger
 * /api/clients/{id}:
 *   put:
 *     summary: Aktualizuj klienta
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Klient zaktualizowany
 *       404:
 *         description: Klient nie znaleziony
 */
router.put('/:id', validate(clientSchema), clientsController.update);

module.exports = router;
