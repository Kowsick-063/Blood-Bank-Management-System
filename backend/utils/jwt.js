const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'bloodbank_jwt_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a JWT token
 * @param {Object} payload - { id, role, email }
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify a JWT token
 * @param {string} token
 * @returns {Object} decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Generate a short-lived token (for password reset / email links)
 */
const generateShortToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

module.exports = { generateToken, verifyToken, generateShortToken };
