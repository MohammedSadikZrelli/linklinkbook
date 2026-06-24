const express = require('express');
const router = express.Router();
const paymentCtrl = require('../controllers/paymentController');
const protect = require('../middleware/auth');
const admin = require('../middleware/admin');
const { validate, validateParams, idParam } = require('../validators');
const { rechargeSchema, purchaseBookSchema } = require('../validators/payment');

router.post('/recharge', protect, validate(rechargeSchema), paymentCtrl.requestRecharge);
router.get('/history', protect, paymentCtrl.getTransactionHistory);
router.post('/purchase', protect, validate(purchaseBookSchema), paymentCtrl.purchaseBook);
router.get('/stats', protect, paymentCtrl.getFinancialStats);
router.put('/recharge/:id/approve', protect, admin, validateParams(idParam), paymentCtrl.approveRecharge);

module.exports = router;
