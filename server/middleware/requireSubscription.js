const requireSubscription = (req, res, next) => {
  if (!req.user.subscriptionActive) {
    return res.status(403).json({
      success: false,
      message: 'Abonnez-vous pour continuer',
      redirect: '#pricing'
    });
  }
  next();
};

module.exports = { requireSubscription };
