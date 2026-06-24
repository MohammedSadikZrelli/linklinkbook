const express = require('express');
const router = express.Router();
const { sendInvitation, getMyInvitations, acceptInvitation, refuseInvitation } = require('../controllers/invitationController');
const protect = require('../middleware/auth');
const { validate, validateParams, idParam } = require('../validators');
const { sendInvitationSchema } = require('../validators/invitation');

router.route('/')
  .post(protect, validate(sendInvitationSchema), sendInvitation)
  .get(protect, getMyInvitations);

router.put('/:id/accept', protect, validateParams(idParam), acceptInvitation);
router.put('/:id/refuse', protect, validateParams(idParam), refuseInvitation);

module.exports = router;
