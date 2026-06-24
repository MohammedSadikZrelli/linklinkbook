const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { validate } = require('../validators');
const { createBookSchema, updateBookSchema } = require('../validators/book');
const { createBook, getBooks, searchBooks, getBook, updateBook, deleteBook, getMyStats } = require('../controllers/bookController');

router.route('/')
  .post(protect, validate(createBookSchema), createBook)
  .get(getBooks);

router.get('/search', searchBooks);
router.get('/my-stats', protect, getMyStats);

router.route('/:id')
  .get(protect, getBook)
  .put(protect, validate(updateBookSchema), updateBook)
  .delete(protect, deleteBook);

module.exports = router;
