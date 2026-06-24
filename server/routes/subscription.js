const express = require('express');
const router = express.Router();
const { purchaseSubscription } = require('../controllers/subscriptionController');
const protect = require('../middleware/auth');
const { validate } = require('../validators');
const { purchaseSubscriptionSchema } = require('../validators/subscription');

router.post('/purchase', protect, validate(purchaseSubscriptionSchema), purchaseSubscription);

module.exports = router;
