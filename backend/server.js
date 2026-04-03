require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const session = require('express-session');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
require('./config/passport');

const app = express();

// Connect Database
connectDB();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'null' // For local file opens
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Sanitize against NoSQL injection
app.use(mongoSanitize());

// Session (required for Passport OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || 'bloodbank_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth', require('./routes/google'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🩸 Blood Bank API is running',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🩸 Blood Bank Server running on http://localhost:${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
