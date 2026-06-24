const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const protect = require('../middleware/auth');
const admin = require('../middleware/admin');
const { validate } = require('../validators');
const { updateUserSchema, upgradeSubscriptionSchema, updateBookSchema } = require('../validators/admin');

router.use(protect, admin);

router.get('/stats', adminCtrl.getStats);

router.get('/users', adminCtrl.getUsers);
router.get('/users/:id', adminCtrl.getUserById);
router.put('/users/:id', validate(updateUserSchema), adminCtrl.updateUser);
router.delete('/users/:id', adminCtrl.deleteUser);
router.put('/users/:id/ban', adminCtrl.banUser);
router.put('/users/:id/unban', adminCtrl.unbanUser);
router.put('/users/:id/ban-ip', adminCtrl.banIp);
router.put('/users/:id/unban-ip', adminCtrl.unbanIp);
router.put('/users/:id/upgrade', validate(upgradeSubscriptionSchema), adminCtrl.upgradeSubscription);
router.put('/users/:id/toggle-access', adminCtrl.toggleAccess);

router.get('/books', adminCtrl.getBooks);
router.put('/books/:id', validate(updateBookSchema), adminCtrl.updateBook);
router.delete('/books/:id', adminCtrl.deleteBook);

router.get('/stats/weekly', adminCtrl.getWeeklyActivity);
router.get('/stats/wilaya', adminCtrl.getWilayaStats);
router.get('/stats/registrations', adminCtrl.getRegistrationEvolution);

module.exports = router;
