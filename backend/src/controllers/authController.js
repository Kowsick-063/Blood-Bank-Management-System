const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { sendOTPEmail } = require('../utils/email');

// ─── Helpers ───────────────────────────────────────────────────────────────
const signToken = (user) => {
  const role = user.email.toLowerCase() === 'bloodbee880@gmail.com' ? 'admin' : (user.role || 'donor');
  return jwt.sign({ id: user.id, email: user.email, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sendTokenCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true, // Prevent XSS access
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    sameSite: 'Strict', // CSRF protection
  };
  res.cookie('token', token, cookieOptions);
};

// ─── POST /api/auth/signup ─────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role, age, blood_group, phone, city } = req.body;

    // 1. Validation
    if (!name || !email || !password || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Valid name, email and password are required.' });
    }

    // 2. Check if user exists
    const { data: existing } = await supabase.from('users').select('id').eq('email', email.toLowerCase()).single();
    if (existing) return res.status(409).json({ message: 'Email already registered.' });

    // 3. Secure OTP Generation
    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
    const otp_expires = new Date(Date.now() + otpExpiryMinutes * 60 * 1000).toISOString();
    
    // 4. Persistence
    const assignedRole = (role === 'admin') ? 'admin' : 'donor';
    const { data: user, error: userError } = await supabase.from('users').insert([{ 
      name, email: email.toLowerCase(), password: hashedPassword, role: assignedRole, 
      is_verified: false, otp, otp_expires, last_otp_sent: new Date().toISOString()
    }]).select().single();

    if (userError) return res.status(500).json({ message: 'Database error during registration.' });

    // Send OTP
    await sendOTPEmail(user.email, user.name, otp);

    return res.status(201).json({
      success: true,
      message: 'Account created! Verification code sent to email.',
      email: email.toLowerCase(),
    });
  } catch (err) {
    console.error('[Register Error]', err.message);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// ─── POST /api/auth/verify-email ─────────────────────────────────────────────
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp || otp.length !== 6) return res.status(400).json({ message: 'Email and valid 6-digit OTP required.' });

    const { data: user, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).single();

    if (error || !user) return res.status(404).json({ message: 'User not found.' });
    if (user.is_verified) return res.status(400).json({ message: 'Email already verified.' });

    if (!user.otp_expires || new Date(user.otp_expires) < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please resend.' });
    }

    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid verification code.' });

    const { error: updateErr } = await supabase.from('users').update({
      is_verified: true, otp: null, otp_expires: null
    }).eq('id', user.id);

    if (updateErr) throw updateErr;

    return res.status(200).json({ success: true, message: 'Email verified! Account secured.' });
  } catch (err) {
    return res.status(500).json({ message: 'Verification failed.' });
  }
};

// ─── POST /api/auth/resend-otp ───────────────────────────────────────────────
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const { data: user, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).single();
    if (error || !user) return res.status(404).json({ message: 'User not found.' });
    if (user.is_verified) return res.status(200).json({ success: true, message: 'Already verified.', alreadyVerified: true });

    // 1. Enforce Cooldown (60 seconds)
    const cooldownPeriod = 60 * 1000;
    const lastSent = new Date(user.last_otp_sent || 0).getTime();
    if (Date.now() - lastSent < cooldownPeriod) {
      const remaining = Math.ceil((cooldownPeriod - (Date.now() - lastSent)) / 1000);
      return res.status(429).json({ message: `Please wait ${remaining} seconds before requesting a new code.` });
    }

    // 2. Regenerate & Send
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
    const otp_expires = new Date(Date.now() + otpExpiryMinutes * 60 * 1000).toISOString();

    await supabase.from('users').update({ 
      otp, otp_expires, last_otp_sent: new Date().toISOString() 
    }).eq('id', user.id);

    await sendOTPEmail(user.email, user.name, otp);
    return res.status(200).json({ success: true, message: 'New verification code sent!' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to send verification code.' });
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Credentials required.' });

    const { data: user, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).single();

    if (error || !user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: 'Please verify your email.', redirect: 'verify-email' });
    }

    const token = signToken(user);
    sendTokenCookie(res, token); // Secure HTTP-only cookie

    const { password: _, otp: __, otp_expires: ___, ...userSafe } = user;
    return res.status(200).json({
      message: 'Login successful.',
      token, // Optional: returned for backward compatibility
      user: userSafe,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Authentication error.' });
  }
};

module.exports = { register, login, verifyEmail, resendOTP };
