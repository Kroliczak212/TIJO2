/**
 * Authentication Service
 *
 * Handles user authentication (login/logout)
 *
 * @author Bartłomiej Król
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const config = require('../config');

class AuthService {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Token and user info
   */
  async login(email, password) {
    // Find user
    const rows = await query(
      'SELECT id, email, password_hash, first_name, last_name FROM users WHERE email = ?',
      [email]
    );
    const user = rows[0];

    if (!user) {
      throw { statusCode: 401, message: 'Nieprawidłowy email lub hasło' };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw { statusCode: 401, message: 'Nieprawidłowy email lub hasło' };
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      }
    };
  }

  /**
   * Get user profile by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getProfile(userId) {
    const rows = await query(
      'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = ?',
      [userId]
    );
    const user = rows[0];

    if (!user) {
      throw { statusCode: 404, message: 'Użytkownik nie znaleziony' };
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      createdAt: user.created_at
    };
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw { statusCode: 401, message: 'Token nieprawidłowy lub wygasł' };
    }
  }
}

module.exports = new AuthService();
