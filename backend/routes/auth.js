const express = require('express');
const router  = express.Router();
const {
  signup,
  verifyEmail,
  resendOTP,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
  approveAdmin,
} = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');

// Public routes
router.post('/signup',          signup);
router.post('/verify-email',    verifyEmail);
router.post('/resend-otp',      resendOTP);
router.post('/login',           login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);
router.post('/logout',          logout);

// Protected routes
router.get('/me', protect, getMe);

// Super-admin only
router.patch('/admin/approve/:userId', protect, restrictTo('admin'), approveAdmin);

module.exports = router;
