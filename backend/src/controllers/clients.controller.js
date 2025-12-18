/**
 * Clients Controller
 * Handles HTTP requests for clients
 */

const clientsService = require('../services/clients.service');

class ClientsController {

    async getAll(req, res, next) {
        try {
            const { search, limit, offset } = req.query;
            const result = await clientsService.getAll({
                search,
                limit: limit ? parseInt(limit) : undefined,
                offset: offset ? parseInt(offset) : undefined
            });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const client = await clientsService.getById(parseInt(req.params.id));
            res.json(client);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const client = await clientsService.create(req.body);
            res.status(201).json(client);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const client = await clientsService.update(parseInt(req.params.id), req.body);
            res.json(client);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ClientsController();
