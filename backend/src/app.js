require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const prisma = require('./prisma/client');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const xss = require('xss-clean');

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────
// 1. Secure Headers (X-Content-Type-Options, X-Frame-Options, HSTS, etc.)
app.use(helmet());

// 2. Enforce HTTPS (using HSTS via helmet + custom check for production)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.status(403).json({ message: 'HTTPS required' });
  }
  next();
});

// 3. CORS Policy - Trust only the specific frontend origin
app.use(cors({ 
  origin: process.env.FRONTEND_URL, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 4. Rate Limiting (General: 100 requests per 15 mins)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

// 5. Data Sanitization & Protection
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(cookieParser());
app.use(xss()); // Sanitize user input
app.use(hpp()); // Prevent HTTP Parameter Pollution

app.use(morgan('dev'));

// ─── Root ────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🩸 Blood Bank Management API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      api: 'GET /api',
      auth: ['POST /api/auth/register', 'POST /api/auth/login'],
      donors: ['POST /api/donors/register', 'PUT /api/donors/availability', 'GET /api/donors/nearby'],
      requests: ['POST /api/requests', 'GET /api/requests/my', 'GET /api/requests/:id'],
      admin: [
        'GET /api/admin/requests', 
        'PUT /api/admin/requests/:id', 
        'GET /api/admin/stock', 
        'PUT /api/admin/stock', 
        'GET /api/admin/donors', 
        'GET /api/admin/stock/history'
      ],
      blood_banks: ['POST /api/blood-banks', 'GET /api/blood-banks']
    },
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
const routes = require('./routes');
app.use('/api', routes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    console.error('DB check failed:', err);
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ message: 'Something went wrong.' });
});

const PORT = process.env.PORT || 5000;

// Start server immediately, connect DB in background
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🕒 Server Time Check: ${new Date().toISOString()}`);
  
  // Try connecting Prisma in background but don't crash the server
  prisma.connectDB().then(() => {
    console.log('✅ PostgreSQL Database connected successfully via Prisma');
  }).catch(err => {
    console.warn('⚠️ Prisma Database connection failed, but server is still running for Supabase endpoints.');
  });
});

module.exports = { app, prisma };
