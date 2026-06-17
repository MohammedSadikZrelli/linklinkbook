const express = require('express');
const router = express.Router();
const { sendInvitation, getMyInvitations, acceptInvitation, refuseInvitation } = require('../controllers/invitationController');
const protect = require('../middleware/auth');

router.route('/')
  .post(protect, sendInvitation)
  .get(protect, getMyInvitations);

router.put('/:id/accept', protect, acceptInvitation);
router.put('/:id/refuse', protect, refuseInvitation);

module.exports = router;
