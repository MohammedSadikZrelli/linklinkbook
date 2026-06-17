const Invitation = require('../models/Invitation');
const Book = require('../models/Book');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Send an invitation (buyer -> seller for a book)
// @route   POST /api/invitations
// @access  Private
const sendInvitation = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    if (!bookId) {
      return res.status(400).json({ success: false, message: 'ID du livre requis' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Livre non trouvé' });
    }

    if (book.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas envoyer une invitation pour votre propre livre' });
    }

    if (book.status !== 'Disponible') {
      return res.status(400).json({ success: false, message: 'Ce livre n\'est plus disponible' });
    }

    const already = await Invitation.findOne({
      book: bookId,
      buyer: req.user._id,
      status: 'pending',
    });
    if (already) {
      return res.status(400).json({ success: false, message: 'Vous avez déjà envoyé une invitation pour ce livre' });
    }

    // Fee logic for non-subscribers
    const isSubscribed = req.user.subscriptionActive;
    let fee = 0;
    if (!isSubscribed) {
      if (book.type === 'échange') fee = 2;
      else if (book.type === 'don') fee = 1;
    }

    if (fee > 0) {
      const buyer = await User.findById(req.user._id);
      if (buyer.balance < fee) {
        return res.status(400).json({
          success: false,
          message: `Solde insuffisant: ${fee} DT requis pour cette opération. Rechargez votre compte.`,
          redirect: '#dashboard'
        });
      }
      buyer.balance -= fee;
      await buyer.save();

      await Transaction.create({
        user: buyer._id,
        type: 'fee',
        amount: -fee,
        relatedBook: book._id,
        description: `Frais ${book.type === 'échange' ? 'd\'échange' : 'de don'} (non-abonné)`,
        status: 'completed'
      });
    }

    const invitation = await Invitation.create({
      book: bookId,
      buyer: req.user._id,
      seller: book.user,
      status: 'pending',
    });

    res.status(201).json({ success: true, data: invitation, fee });
  } catch (error) {
    next(error);
  }
};

// @desc    Get invitations for current user (as buyer or seller)
// @route   GET /api/invitations
// @access  Private
const getMyInvitations = async (req, res, next) => {
  try {
    const asBuyer = await Invitation.find({ buyer: req.user._id })
      .populate('book', 'title images price type status')
      .populate('seller', 'name email phone wilaya')
      .sort({ createdAt: -1 });

    const asSeller = await Invitation.find({ seller: req.user._id })
      .populate('book', 'title images price type status')
      .populate('buyer', 'name email phone wilaya')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { asBuyer, asSeller },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept an invitation (seller only) — auto-refuses others
// @route   PUT /api/invitations/:id/accept
// @access  Private
const acceptInvitation = async (req, res, next) => {
  try {
    const invitation = await Invitation.findById(req.params.id)
      .populate('book');

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation non trouvée' });
    }

    if (invitation.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Cette invitation a déjà été traitée' });
    }

    invitation.status = 'accepted';
    await invitation.save();

    await Book.findByIdAndUpdate(invitation.book._id, { status: 'En attente' });

    await Invitation.updateMany(
      { book: invitation.book._id, _id: { $ne: invitation._id }, status: 'pending' },
      { status: 'refused' }
    );

    res.status(200).json({ success: true, data: invitation });
  } catch (error) {
    next(error);
  }
};

// @desc    Refuse an invitation (seller only)
// @route   PUT /api/invitations/:id/refuse
// @access  Private
const refuseInvitation = async (req, res, next) => {
  try {
    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation non trouvée' });
    }

    if (invitation.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Cette invitation a déjà été traitée' });
    }

    invitation.status = 'refused';
    await invitation.save();

    res.status(200).json({ success: true, data: invitation });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendInvitation, getMyInvitations, acceptInvitation, refuseInvitation };
