const express = require('express');
const router = express.Router();
const paymentCtrl = require('../controllers/paymentController');
const protect = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/recharge', protect, paymentCtrl.requestRecharge);
router.get('/history', protect, paymentCtrl.getTransactionHistory);
router.post('/purchase', protect, paymentCtrl.purchaseBook);
router.get('/stats', protect, paymentCtrl.getFinancialStats);
router.put('/recharge/:id/approve', protect, admin, paymentCtrl.approveRecharge);

module.exports = router;
