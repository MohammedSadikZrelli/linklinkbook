const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const protect = require('../middleware/auth');
const admin = require('../middleware/admin');
const { validate, validateParams, idParam } = require('../validators');
const { updateUserSchema, upgradeSubscriptionSchema, updateBookSchema } = require('../validators/admin');

router.use(protect, admin);

router.get('/stats', adminCtrl.getStats);

router.get('/users', adminCtrl.getUsers);
router.get('/users/:id', validateParams(idParam), adminCtrl.getUserById);
router.put('/users/:id', validateParams(idParam), validate(updateUserSchema), adminCtrl.updateUser);
router.delete('/users/:id', validateParams(idParam), adminCtrl.deleteUser);
router.put('/users/:id/ban', validateParams(idParam), adminCtrl.banUser);
router.put('/users/:id/unban', validateParams(idParam), adminCtrl.unbanUser);
router.put('/users/:id/ban-ip', validateParams(idParam), adminCtrl.banIp);
router.put('/users/:id/unban-ip', validateParams(idParam), adminCtrl.unbanIp);
router.put('/users/:id/upgrade', validateParams(idParam), validate(upgradeSubscriptionSchema), adminCtrl.upgradeSubscription);
router.put('/users/:id/toggle-access', validateParams(idParam), adminCtrl.toggleAccess);

router.get('/books', adminCtrl.getBooks);
router.put('/books/:id', validateParams(idParam), validate(updateBookSchema), adminCtrl.updateBook);
router.delete('/books/:id', validateParams(idParam), adminCtrl.deleteBook);

router.get('/stats/weekly', adminCtrl.getWeeklyActivity);
router.get('/stats/wilaya', adminCtrl.getWilayaStats);
router.get('/stats/registrations', adminCtrl.getRegistrationEvolution);

module.exports = router;
