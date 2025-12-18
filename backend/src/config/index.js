/**
 * Application Configuration
 *
 * @author Bartłomiej Król
 */

module.exports = {
  // Server configuration
  port: process.env.PORT || 3001,

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'vetcrm-receptionist-secret-key-2024',
    expiresIn: '24h'
  },

  // Environment
  env: process.env.NODE_ENV || 'development'
};
