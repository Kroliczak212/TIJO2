/**
 * Swagger/OpenAPI Configuration
 *
 * @author Bartłomiej Król
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VetCRM Receptionist Module API',
      version: '1.0.0',
      description: 'REST API dla modułu recepcjonisty w systemie VetCRM. Zarządzanie wizytami, klientami, zwierzętami i lekarzami.',
      contact: {
        name: 'Bartłomiej Król',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'http://localhost:8080/api',
        description: 'Production server (Docker)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Wprowadź token JWT otrzymany z endpointa /api/auth/login',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Ścieżka do plików z JSDoc komentarzami
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
