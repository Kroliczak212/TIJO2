/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */

const authService = require('../services/auth.service');

class AuthController {

    async login(req, res, next) {
        try {
            const { email, password } = req.body;



            const result = await authService.login(email, password);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async register(req, res, next) {
        try {
            const result = await authService.register(req.body);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async me(req, res, next) {
        try {
            const user = await authService.getUserById(req.user.id);
            res.json(user);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
