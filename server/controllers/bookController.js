const Book = require('../models/Book');
const mongoose = require('mongoose');

// @desc    Create a new book
// @route   POST /api/books
// @access  Private
const createBook = async (req, res, next) => {
  try {
    const { title, subject, level, condition, price, type, status, images, description, location, author, isbn } = req.body;

    const isSubscribed = req.user.subscriptionActive;

    if (!isSubscribed) {
      if (type === 'don') {
        // Making a donation is free for everyone
      } else {
        // Non-sub: limited to 1 active vente/échange book
        const activeCount = await Book.countDocuments({
          user: req.user._id,
          type: { $in: ['vente', 'échange'] },
          status: { $in: ['Disponible', 'En attente'] }
        });
        if (activeCount >= 1) {
          return res.status(403).json({
            success: false,
            message: 'Accès limité: vous avez atteint la limite de 1 annonce. Abonnez-vous pour publier en illimité.',
            redirect: '#pricing'
          });
        }
      }
    }

    const book = await Book.create({
      title,
      subject,
      level,
      condition,
      price,
      type,
      status,
      description,
      author,
      isbn,
      location,
      user: req.user._id,
      images: images || [],
    });

    res.status(201).json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all books (public) or for a specific user
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res, next) => {
  try {
    let query = {};

    // If ?user=<id> is provided, return that user's books (no status filter)
    if (req.query.user && mongoose.Types.ObjectId.isValid(req.query.user)) {
      query.user = req.query.user;
    } else {
      // Public listing: only available books
      query.status = 'Disponible';
    }

    // Public filters
    if (req.query.type) query.type = req.query.type;
    if (req.query.subject) query.subject = { $regex: req.query.subject, $options: 'i' };

    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .populate('user', 'name email phone profileType schoolLevel wilaya address location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: books
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search books with full-text and filters
// @route   GET /api/books/search
// @access  Public
const searchBooks = async (req, res, next) => {
  try {
    const { q, subject, wilaya, type, level } = req.query;
    const query = { status: 'Disponible' };

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } },
        { level: { $regex: q, $options: 'i' } },
      ];
    }
    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (wilaya) query.wilaya = { $regex: wilaya, $options: 'i' };
    if (type) query.type = type;
    if (level) query.level = { $regex: level, $options: 'i' };

    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .populate('user', 'name email phone profileType schoolLevel wilaya address location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: books
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Private
const getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('user', 'name email phone profileType schoolLevel wilaya address location');
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private
const updateBook = async (req, res, next) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Make sure user owns book (admins can update any book)
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && book.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this book' });
    }

    const allowed = ['title', 'subject', 'level', 'condition', 'price', 'type', 'status', 'description', 'location', 'images', 'author', 'isbn'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    book = await Book.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Make sure user owns book
    if (book.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this book' });
    }

    await book.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's dashboard stats
// @route   GET /api/books/my-stats
// @access  Private
const getMyStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const Invitation = require('../models/Invitation');

    const allBooks = await Book.find({ user: userId }).sort({ createdAt: -1 });

    const ventes = allBooks.filter(b => b.type === 'vente');
    const echanges = allBooks.filter(b => b.type === 'échange');
    const dons = allBooks.filter(b => b.type === 'don');

    const revenue = ventes.reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0);

    const bookIds = allBooks.map(b => b._id);
    const invitationCounts = await Invitation.aggregate([
      { $match: { book: { $in: bookIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const invStats = { pending: 0, accepted: 0, refused: 0 };
    invitationCounts.forEach(g => { invStats[g._id] = g.count; });

    res.json({
      success: true,
      data: {
        totalBooks: allBooks.length,
        ventes: ventes.length,
        echanges: echanges.length,
        dons: dons.length,
        revenue: Math.round(revenue * 100) / 100,
        recentBooks: allBooks.slice(0, 5),
        invitations: invStats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBook,
  getBooks,
  searchBooks,
  getBook,
  updateBook,
  deleteBook,
  getMyStats
};
