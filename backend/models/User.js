const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['donor', 'admin'],
    required: [true, 'Role is required']
  },
  // Donor-specific fields
  age: {
    type: Number,
    min: [18, 'Minimum age is 18'],
    max: [65, 'Maximum age is 65']
  },
  blood_group: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  phone: {
    type: String,
    match: [/^[+]?[\d\s\-()]{7,15}$/, 'Please enter a valid phone number']
  },
  // Auth fields
  is_verified: {
    type: Boolean,
    default: false
  },
  is_approved: {
    type: Boolean,
    default: true // Donors auto-approved; admins set to false by pre-save hook
  },
  google_id: {
    type: String,
    sparse: true
  },
  // OTP
  otp: String,
  otp_expires: Date,
  otp_attempts: {
    type: Number,
    default: 0
  },
  // Password reset
  reset_token: String,
  reset_token_expires: Date,
  // Timestamps
  last_login: Date
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Pre-save: hash password + set admin is_approved to false
userSchema.pre('save', async function (next) {
  // Admin approval logic
  if (this.isNew && this.role === 'admin') {
    this.is_approved = false;
  }

  // Hash password only if modified
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Sanitize for JSON output
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otp_expires;
  delete obj.otp_attempts;
  delete obj.reset_token;
  delete obj.reset_token_expires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
