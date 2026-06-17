const express = require('express');
const router = express.Router();
const { purchaseSubscription } = require('../controllers/subscriptionController');
const protect = require('../middleware/auth');

router.post('/purchase', protect, purchaseSubscription);

module.exports = router;
