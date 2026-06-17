const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
}));

router.get('/callback', passport.authenticate('google', {
  session: false,
  failureRedirect: 'http://localhost:5173/#login',
}), (req, res) => {
  const { token, user } = req.user;
  res.redirect(`http://localhost:5173/#google-callback?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`);
});

module.exports = router;
