const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/authMiddleware');
const { createBloodBank, getBloodBanks, updateStock, findNearby } = require('../controllers/bloodBankController');

// All endpoints require authentication
router.use(protect);

// Admin-only to create banks
router.post('/', requireRole('admin'), createBloodBank);

// Anyone logged in can view banks
router.get('/', getBloodBanks);

// Update units - restricted to admins or staff
router.post('/update-stock', requireRole('admin'), updateStock);

// Nearby search
router.get('/nearby/:requestId', findNearby);

module.exports = router;
