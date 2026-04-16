const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/authMiddleware');
const {
  getAllRequests,
  updateRequestStatus,
  getBloodStock,
  updateBloodStock,
  getDonors,
  getStockHistory,
} = require('../controllers/adminController');

// All admin routes must be protected and restricted to the 'admin' role
router.use(protect);
router.use(requireRole('admin'));

// Blood Requests
router.get('/requests', getAllRequests);
router.put('/requests/:id', updateRequestStatus);

// Blood Stock & History
router.get('/stock', getBloodStock);
router.put('/stock', updateBloodStock);
router.get('/stock/history', getStockHistory);

// Donors
router.get('/donors', getDonors);

module.exports = router;
