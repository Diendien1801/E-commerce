const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      let user = await User.findOne({ email });

      if (!user) {
        // The user has never registered with this Gmail before.
        user = new User({
          name:       email.split('@')[0],
          email,
          avatar:     profile.photos[0].value,
          password:   null,
          isVerified: true,
          googleId:   profile.id
        });
        await user.save();
      } else if (!user.isVerified) {
        // The user already has an account (not verified)
        // Just update isVerified + googleId if not present
        user.isVerified = true;
        if (!user.googleId) {
          user.googleId = profile.id;
        }
        await user.save();
      }
      // The user has already been verified → just log in normally.

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});