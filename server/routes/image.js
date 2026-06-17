const express = require('express');
const router = express.Router();
const { enhanceImage, analyzeImage } = require('../controllers/imageController');
const protect = require('../middleware/auth');
const { upload } = require('../controllers/uploadController');

router.post('/enhance', protect, upload.single('image'), enhanceImage);
router.post('/analyze', protect, upload.single('image'), analyzeImage);

module.exports = router;

