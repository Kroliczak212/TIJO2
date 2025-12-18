/**
 * Authentication Middleware
 *
 * Verifies JWT tokens on protected routes
 *
 * @author Bartłomiej Król
 */

const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Verify JWT token middleware
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Brak tokenu autoryzacji',
      code: 'MISSING_TOKEN'
    });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token wygasł',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(401).json({
      error: 'Token nieprawidłowy',
      code: 'INVALID_TOKEN'
    });
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = decoded;
    } catch (error) {
      // Ignore invalid tokens for optional auth
    }
  }

  next();
}

module.exports = {
  authenticate,
  optionalAuth
};
