const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

/**
 * Signs an access JWT for a user
 * @param {object} payload - { id, email, role, name }
 * @returns {string} token
 */
function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN
  });
}

/**
 * Signs a refresh JWT for a user session
 * @param {object} payload - { id, sessionId }
 * @returns {string} token
 */
function signRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN
  });
}

/**
 * Verifies an access token
 * @param {string} token
 * @returns {object} decoded payload
 */
function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

/**
 * Verifies a refresh token
 * @param {string} token
 * @returns {object} decoded payload
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};

