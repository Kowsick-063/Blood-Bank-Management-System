const express  = require('express');
const passport = require('passport');
const router   = express.Router();
const { generateToken } = require('../utils/jwt');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Initiate Google OAuth — store role in session
router.get('/google', (req, res, next) => {
  const role = req.query.role || 'donor';
  req.session.googleRole = role;
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: role,
  })(req, res, next);
});

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=google_failed` }),
  (req, res) => {
    try {
      const user  = req.user;
      const token = generateToken({ id: user._id, role: user.role, email: user.email });

      // Send token via URL for the SPA to capture
      const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/donor/dashboard';
      res.redirect(`${FRONTEND_URL}/oauth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user.toSafeObject()))}&redirect=${redirectPath}`);
    } catch (err) {
      res.redirect(`${FRONTEND_URL}/login?error=server_error`);
    }
  }
);

module.exports = router;
