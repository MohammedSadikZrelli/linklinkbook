const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { validate, validateParams, idParam } = require('../validators');
const { createBookSchema, updateBookSchema } = require('../validators/book');
const { createBook, getBooks, searchBooks, getBook, updateBook, deleteBook, getMyStats } = require('../controllers/bookController');

router.route('/')
  .post(protect, validate(createBookSchema), createBook)
  .get(getBooks);

router.get('/search', searchBooks);
router.get('/my-stats', protect, getMyStats);

router.route('/:id')
  .get(protect, validateParams(idParam), getBook)
  .put(protect, validateParams(idParam), validate(updateBookSchema), updateBook)
  .delete(protect, validateParams(idParam), deleteBook);

module.exports = router;
