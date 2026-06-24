const User = require('../models/User');
const Book = require('../models/Book');
const Subscription = require('../models/Subscription');

const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    const totalSubscriptions = await Subscription.countDocuments({ paymentStatus: 'completed' });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const activeSubscriptions = await Subscription.countDocuments({
      paymentStatus: 'completed',
      endDate: { $gt: new Date() }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBooks,
        totalSubscriptions,
        bannedUsers,
        activeSubscriptions
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, isBanned } = req.query;
    const query = {};

    if (search) {
      const s = String(search);
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } },
        { profileType: { $regex: s, $options: 'i' } },
        { 'address.street': { $regex: s, $options: 'i' } },
        { 'address.city': { $regex: s, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (isBanned !== undefined) query.isBanned = isBanned === 'true';

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const userBooks = await Book.find({ user: user._id }).sort({ createdAt: -1 });
    const userSubscription = await Subscription.findOne({ user: user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        user,
        books: userBooks,
        subscription: userSubscription
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, profileType, schoolLevel, wilaya, address, role, isPro } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (profileType !== undefined) user.profileType = profileType;
    if (schoolLevel !== undefined) user.schoolLevel = schoolLevel;
    if (wilaya !== undefined) user.wilaya = wilaya;
    if (address !== undefined) {
      user.address = {
        street: address.street || address.addressLine || '',
        city: address.city || '',
        postalCode: address.postalCode || ''
      };
    }
    if (role !== undefined) user.role = role;
    if (isPro !== undefined) user.isPro = isPro;

    await user.save();

    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const banUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    user.isBanned = true;
    await user.save();

    res.json({
      success: true,
      message: 'Utilisateur banni avec succès',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const unbanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    user.isBanned = false;
    await user.save();

    res.json({
      success: true,
      message: 'Utilisateur débanni avec succès',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const banIp = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const ipToBan = user.ip || req.ip;
    user.bannedIp = ipToBan;
    user.isBanned = true;
    await user.save();

    await User.updateMany(
      { ip: ipToBan, _id: { $ne: user._id } },
      { isBanned: true, bannedIp: ipToBan }
    );

    res.json({
      success: true,
      message: `IP ${ipToBan} bannie avec succès`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const unbanIp = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const ipToUnban = user.bannedIp;
    user.bannedIp = '';
    user.isBanned = false;
    await user.save();

    if (ipToUnban) {
      await User.updateMany(
        { bannedIp: ipToUnban },
        { isBanned: false, bannedIp: '' }
      );
    }

    res.json({
      success: true,
      message: 'IP débannie avec succès',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const upgradeSubscription = async (req, res, next) => {
  try {
    const { months = 12 } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    let subscription = await Subscription.findOne({
      user: user._id,
      paymentStatus: 'completed',
      endDate: { $gt: new Date() }
    });

    if (subscription) {
      subscription.endDate = endDate;
      subscription.amount = 10 * (months / 12);
      await subscription.save();
    } else {
      subscription = await Subscription.create({
        user: user._id,
        startDate,
        endDate,
        amount: 10 * (months / 12),
        paymentStatus: 'completed'
      });
    }

    user.subscriptionActive = true;
    user.subscriptionExpiresAt = endDate;
    user.isPro = true;
    await user.save();

    res.json({
      success: true,
      message: `Abonnement activé pour ${months} mois`,
      data: { user, subscription }
    });
  } catch (error) {
    next(error);
  }
};

const toggleAccess = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    if (user.subscriptionActive) {
      user.subscriptionActive = false;
      user.isPro = false;
    } else {
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
    }

    await user.save();

    res.json({
      success: true,
      message: user.subscriptionActive
        ? 'Accès activé avec succès'
        : 'Accès désactivé',
      data: {
        subscriptionActive: user.subscriptionActive,
        isPro: user.isPro,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
      }
    });
  } catch (error) {
    next(error);
  }
};

const getBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, type, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      const s = String(search);
      query.$or = [
        { title: { $regex: s, $options: 'i' } },
        { subject: { $regex: s, $options: 'i' } }
      ];
    }

    const books = await Book.find(query)
      .populate('user', 'name email phone wilaya')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Book.countDocuments(query);

    res.json({
      success: true,
      count: books.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: books
    });
  } catch (error) {
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Livre non trouvé' });
    }

    const allowed = ['title', 'subject', 'level', 'condition', 'price', 'type', 'status', 'description', 'location', 'images', 'author', 'isbn'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const updated = await Book.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Livre non trouvé' });
    }

    await book.deleteOne();

    res.json({
      success: true,
      message: 'Livre supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    await Book.deleteMany({ user: user._id });
    await Subscription.deleteMany({ user: user._id });
    await user.deleteOne();

    res.json({
      success: true,
      message: 'Utilisateur et toutes ses données supprimés'
    });
  } catch (error) {
    next(error);
  }
};

const getWeeklyActivity = async (req, res, next) => {
  try {
    const days = 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const Book = require('../models/Book');
    const Invitation = require('../models/Invitation');

    const booksAgg = await Book.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const invAgg = await Invitation.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      result.push({
        date: d,
        books: booksAgg.find(b => b._id === d)?.count || 0,
        invitations: invAgg.find(b => b._id === d)?.count || 0,
      });
    }
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

const getWilayaStats = async (req, res, next) => {
  try {
    const Book = require('../models/Book');
    const wilayaAgg = await Book.aggregate([
      { $match: { location: { $ne: '' } } },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json({ success: true, data: wilayaAgg.map(w => ({ wilaya: w._id, count: w.count })) });
  } catch (error) { next(error); }
};

const getRegistrationEvolution = async (req, res, next) => {
  try {
    const days = 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const User = require('../models/User');
    const agg = await User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      result.push({ date: d, users: agg.find(a => a._id === d)?.count || 0 });
    }
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

module.exports = {
  getStats,
  getUsers,
  getUserById,
  updateUser,
  banUser,
  unbanUser,
  banIp,
  unbanIp,
  upgradeSubscription,
  toggleAccess,
  getBooks,
  updateBook,
  deleteBook,
  deleteUser,
  getWeeklyActivity,
  getWilayaStats,
  getRegistrationEvolution
};
