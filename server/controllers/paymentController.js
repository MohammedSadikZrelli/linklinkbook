const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Book = require('../models/Book');
const { sanitize } = require('../utils/sanitize');

// @desc    Request a balance recharge (User uploads proof)
// @route   POST /api/payments/recharge
// @access  Private
exports.requestRecharge = async (req, res, next) => {
  try {
    let { amount, proofImage, method } = req.body;
    if (method) method = sanitize(method);
    if (!amount || !proofImage) {
      return res.status(400).json({ success: false, message: 'Montant et preuve requis' });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'recharge',
      amount: Number(amount),
      status: 'pending',
      proofImage,
      description: `Recharge via ${method || 'D17'}`
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user transaction history
// @route   GET /api/payments/history
// @access  Private
exports.getTransactionHistory = async (req, res, next) => {
  try {
    const isSubscribed = req.user.subscriptionActive;
    let query = Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('relatedBook', 'title')
      .populate('relatedUser', 'name');

    if (!isSubscribed) {
      query = query.limit(5);
    }

    const transactions = await query;

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

// @desc    Purchase a book using balance
// @route   POST /api/payments/purchase
// @access  Private
exports.purchaseBook = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findById(bookId).populate('user');
    
    if (!book) return res.status(404).json({ success: false, message: 'Livre non trouvé' });
    if (book.status !== 'Disponible') return res.status(400).json({ success: false, message: 'Livre non disponible' });
    if (book.user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas acheter votre propre livre' });
    }
    
    const buyer = await User.findById(req.user._id);
    const seller = await User.findById(book.user._id);
    
    const price = Number(book.price) || 0;
    const fee = 1; // 1 DT platform fee
    const totalCost = price + fee;

    if (buyer.balance < totalCost) {
      return res.status(400).json({ success: false, message: 'Solde insuffisant (Prix + 1 DT frais)' });
    }

    // 1. Deduct from buyer
    buyer.balance -= totalCost;
    await buyer.save();

    // 2. Add to seller
    seller.balance += price;
    await seller.save();

    // 3. Mark book as sold
    book.status = 'Vendu';
    await book.save();

    // 4. Record transactions
    // Buyer's purchase
    await Transaction.create({
      user: buyer._id,
      type: 'purchase',
      amount: -price,
      relatedBook: book._id,
      relatedUser: seller._id,
      description: `Achat de "${book.title}"`,
      status: 'completed'
    });

    // Buyer's fee
    await Transaction.create({
      user: buyer._id,
      type: 'fee',
      amount: -fee,
      description: `Frais de service LinkBook`,
      status: 'completed'
    });

    // Seller's sale
    await Transaction.create({
      user: seller._id,
      type: 'sale',
      amount: price,
      relatedBook: book._id,
      relatedUser: buyer._id,
      description: `Vente de "${book.title}"`,
      status: 'completed'
    });

    res.status(200).json({ 
      success: true, 
      message: 'Achat réussi',
      newBalance: buyer.balance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Approve recharge
// @route   PUT /api/payments/recharge/:id/approve
// @access  Private/Admin
exports.approveRecharge = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction || transaction.type !== 'recharge' || transaction.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Transaction invalide' });
    }

    const user = await User.findById(transaction.user);
    user.balance += transaction.amount;
    await user.save();

    transaction.status = 'completed';
    await transaction.save();

    res.status(200).json({ success: true, message: 'Recharge approuvée' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get real-time financial stats for dashboard
// @route   GET /api/payments/stats
// @access  Private
exports.getFinancialStats = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id });
    
    const recharges = transactions.filter(t => t.type === 'recharge' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const spending = transactions.filter(t => t.type === 'purchase' || t.type === 'fee')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    const earnings = transactions.filter(t => t.type === 'sale')
      .reduce((sum, t) => sum + t.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        totalRecharged: recharges,
        totalSpent: spending,
        totalEarned: earnings,
        transactionCount: transactions.length
      }
    });
  } catch (error) {
    next(error);
  }
};
