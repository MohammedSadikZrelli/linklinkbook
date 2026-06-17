const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error('JWT_SECRET is not defined');
        return res.status(500).json({ success: false, message: 'Erreur de configuration serveur' });
      }
      const decoded = jwt.verify(token, secret);

      // Get user from the token, exclude password
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
      }

      if (req.user.isBanned) {
        return res.status(403).json({ success: false, message: 'Votre compte a été suspendu. Contactez l\'administrateur.' });
      }

      // Auto-expire subscription if past expiry date
      if (req.user.subscriptionExpiresAt && req.user.subscriptionExpiresAt < new Date()) {
        req.user.subscriptionActive = false;
        req.user.isPro = false;
        await req.user.save();
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Non autorisé, token invalide' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Non autorisé, aucun token fourni' });
  }
};
