const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) return done(null, false, { message: 'No email from Google' });

    let user = await User.findOne({ email });

    if (user) {
      const token = generateToken(user._id);
      return done(null, { token, user });
    }

    user = await User.create({
      name: profile.displayName,
      email,
      phone: '',
      password: '',
      emailVerified: true,
    });

    const token = generateToken(user._id);
    done(null, { token, user });
  } catch (err) {
    done(err, null);
  }
}));

module.exports = passport;
