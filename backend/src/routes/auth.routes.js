/**
 * Auth Routes
 *
 * @author Bartłomiej Król
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { loginSchema } = require('../validators/schemas');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autoryzacja i uwierzytelnianie
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Logowanie użytkownika
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: recepcja@vetcrm.pl
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Recepcja123!
 *     responses:
 *       200:
 *         description: Logowanie udane, zwraca token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *       400:
 *         description: Błąd walidacji
 *       401:
 *         description: Nieprawidłowy email lub hasło
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Rejestracja nowego użytkownika
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Użytkownik utworzony
 *       400:
 *         description: Błąd walidacji
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Pobierz dane zalogowanego użytkownika
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dane użytkownika
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *       401:
 *         description: Brak autoryzacji
 */
router.get('/me', authenticate, authController.me);

module.exports = router;
