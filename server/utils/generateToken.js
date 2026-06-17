const jwt = require('jsonwebtoken');

/**
 * Generates a signed JSON Web Token (JWT) for user sessions
 * @param {string} id - The MongoDB User ID
 * @returns {string} Signed JWT token
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'linkbooksecretjwtkey123',
    { expiresIn: '30d' }
  );
};

module.exports = generateToken;
