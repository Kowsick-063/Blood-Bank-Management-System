const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  passReqToCallback: true,
},
async (req, accessToken, refreshToken, profile, done) => {
  try {
    const role  = req.session?.googleRole || req.query?.state || 'donor';
    const email = profile.emails?.[0]?.value;
    const name  = profile.displayName;

    if (!email) {
      return done(null, false, { message: 'No email from Google account' });
    }

    // Check if user already exists
    let user = await User.findOne({ $or: [{ google_id: profile.id }, { email }] });

    if (user) {
      // Link Google ID if not already linked
      if (!user.google_id) {
        user.google_id = profile.id;
        await user.save({ validateBeforeSave: false });
      }
      return done(null, user);
    }

    // Create new user
    user = await User.create({
      name,
      email,
      google_id: profile.id,
      role,
      is_verified: true,
      is_approved: role === 'admin' ? false : true,
    });

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
