const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login, verifyEmail, resendOTP } = require('../controllers/authController');

// 🔒 OTP Rate Limiter: Max 5 requests per 15 minutes per IP
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many OTP requests. Please wait 15 minutes.' }
});

router.post('/signup', register);
router.post('/login', login);
router.post('/verify-email', otpLimiter, verifyEmail);
router.post('/resend-otp', otpLimiter, resendOTP);

module.exports = router;
