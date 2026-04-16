const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const donorRoutes = require('./donorRoutes');
const requestRoutes = require('./requestRoutes');
const adminRoutes = require('./admin');
const userRoutes = require('./user');
const bloodBankRoutes = require('./bloodBankRoutes');

router.use('/auth', authRoutes);
router.use('/donors', donorRoutes);
router.use('/requests', requestRoutes);
router.use('/admin', adminRoutes);
router.use('/user', userRoutes);
router.use('/blood-banks', bloodBankRoutes);

// Health check
router.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

module.exports = router;
