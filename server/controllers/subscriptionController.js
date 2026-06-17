const User = require('../models/User');
const Subscription = require('../models/Subscription');

const purchaseSubscription = async (req, res, next) => {
  try {
    const { planType } = req.body;
    if (planType !== 'pro') {
      return res.status(400).json({ success: false, message: 'Type de plan invalide' });
    }

    const user = req.user;
    const now = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    let subscription = await Subscription.findOne({
      user: user._id,
      paymentStatus: 'completed',
      endDate: { $gt: now }
    });

    if (subscription) {
      subscription.endDate = endDate;
      await subscription.save();
    } else {
      subscription = await Subscription.create({
        user: user._id,
        startDate: now,
        endDate,
        amount: 10,
        paymentStatus: 'completed'
      });
    }

    user.subscriptionActive = true;
    user.isPro = true;
    user.subscriptionExpiresAt = endDate;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Abonnement Pro activé avec succès !',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          subscriptionActive: user.subscriptionActive,
          isPro: user.isPro,
          subscriptionExpiresAt: user.subscriptionExpiresAt,
        },
        subscription,
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { purchaseSubscription };
