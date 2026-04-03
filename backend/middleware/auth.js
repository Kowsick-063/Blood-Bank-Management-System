const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Protect routes — verify JWT Bearer token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password -otp -otp_expires -reset_token -reset_token_expires');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ success: false, message: 'Please verify your email first.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

/**
 * Restrict to specific roles
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. This route is for ${roles.join('/')} only.`
    });
  }
  next();
};

module.exports = { protect, restrictTo };
