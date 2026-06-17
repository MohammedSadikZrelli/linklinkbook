const express = require('express');
const router = express.Router();
const passport = require('passport');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

router.get('/', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
}));

router.get('/callback', passport.authenticate('google', {
  session: false,
  failureRedirect: `${FRONTEND_URL}/#login`,
}), (req, res) => {
  const { token, user } = req.user;
  res.redirect(`${FRONTEND_URL}/#google-callback?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`);
});

module.exports = router;
