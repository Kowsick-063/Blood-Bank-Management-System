const crypto = require('crypto');
const User = require('../models/User');
const { generateToken, generateShortToken, verifyToken } = require('../utils/jwt');
const { sendOTPEmail, sendPasswordResetEmail } = require('../utils/email');

// ── Generate 6-digit OTP ──
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─────────────────────────────────────────────
// POST /api/auth/signup
// ─────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, age, blood_group, phone } = req.body;

    // Check required
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password and role are required.' });
    }

    // Donor-specific validation
    if (role === 'donor' && (!age || !blood_group || !phone)) {
      return res.status(400).json({ success: false, message: 'Age, blood group and phone are required for donors.' });
    }

    // Check existing user
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otp_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Build user object
    const userData = { name, email, password, role, otp, otp_expires };
    if (role === 'donor') {
      userData.age       = age;
      userData.blood_group = blood_group;
      userData.phone     = phone;
    }

    const user = await User.create(userData);

    // Send OTP email
    try {
      await sendOTPEmail(email, name, otp);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
      // Don't fail signup if email fails
    }

    res.status(201).json({
      success: true,
      message: `Account created! A verification OTP has been sent to ${email}.`,
      email,
    });

  } catch (err) {
    console.error('Signup error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join('. ');
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: 'Server error during signup.' });
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/verify-email
// ─────────────────────────────────────────────
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +otp_expires +otp_attempts');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.is_verified) {
      return res.status(400).json({ success: false, message: 'Email is already verified.' });
    }

    // Check attempts
    if (user.otp_attempts >= 5) {
      return res.status(429).json({ success: false, message: 'Too many attempts. Please request a new OTP.' });
    }

    // Check expiry
    if (!user.otp_expires || user.otp_expires < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Check OTP
    if (user.otp !== otp) {
      user.otp_attempts = (user.otp_attempts || 0) + 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    // Verify user
    user.is_verified   = true;
    user.otp           = undefined;
    user.otp_expires   = undefined;
    user.otp_attempts  = 0;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Email verified successfully! You can now log in.' });

  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ success: false, message: 'Server error during verification.' });
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/resend-otp
// ─────────────────────────────────────────────
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.is_verified) return res.status(400).json({ success: false, message: 'Email is already verified.' });

    const otp = generateOTP();
    user.otp           = otp;
    user.otp_expires   = new Date(Date.now() + 10 * 60 * 1000);
    user.otp_attempts  = 0;
    await user.save({ validateBeforeSave: false });

    await sendOTPEmail(email, user.name, otp);

    res.json({ success: true, message: 'New OTP sent to your email.' });

  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ success: false, message: 'Failed to resend OTP.' });
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Role check
    if (role && user.role !== role) {
      return res.status(403).json({ success: false, message: `This account is registered as a ${user.role}, not ${role}.` });
    }

    // Password check
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Verified check
    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
        redirect: 'verify-email'
      });
    }

    // Admin approval check
    if (user.role === 'admin' && !user.is_approved) {
      return res.status(403).json({
        success: false,
        message: 'Your admin account is pending approval. Please contact a super-admin.'
      });
    }

    // Update last login
    user.last_login = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate JWT
    const token = generateToken({ id: user._id, role: user.role, email: user.email });

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: user.toSafeObject(),
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If this email is registered, you will receive a reset link.' });
    }

    const resetToken = generateShortToken({ id: user._id, email: user.email });
    user.reset_token         = resetToken;
    user.reset_token_expires = new Date(Date.now() + 60 * 60 * 1000); // 1hr
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl    = `${frontendUrl}/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(email, user.name, resetUrl);

    res.json({ success: true, message: 'Password reset link sent to your email.' });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/reset-password
// ─────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset link. Please request a new one.' });
    }

    const user = await User.findOne({
      _id:                decoded.id,
      reset_token:        token,
      reset_token_expires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Reset link has expired. Please request a new one.' });
    }

    user.password            = password;
    user.reset_token         = undefined;
    user.reset_token_expires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully! You can now log in.' });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
};

// ─────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────
exports.logout = (req, res) => {
  req.logout?.(() => {});
  req.session?.destroy?.(() => {});
  res.json({ success: true, message: 'Logged out successfully.' });
};

// ─────────────────────────────────────────────
// PATCH /api/auth/admin/approve/:userId  (super-admin only)
// ─────────────────────────────────────────────
exports.approveAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { is_approved: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: `Admin ${user.email} approved.`, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
