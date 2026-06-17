const Invitation = require('../models/Invitation');

// @desc    Get notifications for current user (from invitations)
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const asSeller = await Invitation.find({ seller: userId })
      .populate('buyer', 'name')
      .populate('book', 'title')
      .sort({ createdAt: -1 })
      .limit(20);

    const asBuyer = await Invitation.find({ buyer: userId })
      .populate('seller', 'name')
      .populate('book', 'title')
      .sort({ createdAt: -1 })
      .limit(20);

    const notifications = [];

    asSeller.forEach(inv => {
      const label = inv.status === 'pending' ? 'Nouvelle invitation' :
                    inv.status === 'accepted' ? 'Invitation acceptée' :
                    'Invitation refusée';
      notifications.push({
        _id: inv._id,
        type: 'invitation_seller',
        message: `${inv.buyer?.name || 'Quelqu\'un'} veut ${inv.book?.title || 'un livre'}`,
        label,
        status: inv.status,
        invitationId: inv._id,
        bookTitle: inv.book?.title,
        createdAt: inv.createdAt,
        read: false,
      });
    });

    asBuyer.forEach(inv => {
      const label = inv.status === 'pending' ? 'En attente' :
                    inv.status === 'accepted' ? 'Acceptée' :
                    'Refusée';
      notifications.push({
        _id: inv._id,
        type: 'invitation_buyer',
        message: inv.status === 'accepted'
          ? `Votre invitation pour ${inv.book?.title || 'un livre'} a été acceptée`
          : inv.status === 'refused'
          ? `Votre invitation pour ${inv.book?.title || 'un livre'} a été refusée`
          : `Invitation envoyée pour ${inv.book?.title || 'un livre'}`,
        label,
        status: inv.status,
        invitationId: inv._id,
        bookTitle: inv.book?.title,
        createdAt: inv.createdAt,
        read: false,
      });
    });

    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const pendingCount = asSeller.filter(i => i.status === 'pending').length;

    res.status(200).json({
      success: true,
      count: notifications.length,
      pendingCount,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications };
