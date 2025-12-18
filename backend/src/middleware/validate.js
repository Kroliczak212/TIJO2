/**
 * Zod Validation Middleware
 * 
 * Validates request body/query/params against a Zod schema.
 * Sends 400 Bad Request with detailed error messages if validation fails.
 */
const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
    try {
        // Determine what to validate based on schema structure or default to body
        // If schema is a bare ZodObject, we assume it validates req.body
        // If it has shape properties like { body: ..., query: ... }, we use those

        // For simplicity in this project: 
        // We assume the schema validates the request body by default, 
        // unless wrapped in an object with specific keys.

        // Actually, a cleaner approach for Express is:
        // schema.parse({ body: req.body, query: req.query, params: req.params })
        // But usually we just want to validate body.

        // Let's support both approaches. 
        // If schema is ZodObject, we validate req.body.

        schema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Format Zod errors to be user-friendly
            const errors = error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));

            // Debugging for tests
            if (process.env.NODE_ENV === 'test') {
                console.error('Validation Error:', JSON.stringify(errors, null, 2));
            }

            return res.status(400).json({
                error: 'Błąd walidacji',
                details: errors
            });
        }
        next(error);
    }
};

/**
 * Validates specific parts of the request
 * @param {import('zod').ZodSchema} schema 
 * @param {'body'|'query'|'params'} source 
 */
const validateRequest = (schema, source = 'body') => (req, res, next) => {
    try {
        const data = req[source];
        const result = schema.parse(data);

        // Replace request data with parsed (and strictly filtered) data
        // specific for this source
        req[source] = result;

        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            return res.status(400).json({
                error: `Błąd walidacji (${source})`,
                details: errors
            });
        }
        next(error);
    }
};

module.exports = { validate, validateRequest };
