const jwt = require('jsonwebtoken');

/**
 * Generates a signed JSON Web Token (JWT) for user sessions
 * @param {string} id - The MongoDB User ID
 * @returns {string} Signed JWT token
 */
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

module.exports = generateToken;
