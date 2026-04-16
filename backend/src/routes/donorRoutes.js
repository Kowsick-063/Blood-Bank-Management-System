const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { registerDonor, toggleAvailability, getNearbyDonors } = require('../controllers/donorController');

// All donor routes require authentication
router.use(protect);

// POST /api/donors/register
router.post('/register', registerDonor);

// PUT /api/donors/availability
router.put('/availability', toggleAvailability);

// GET /api/donors/nearby
router.get('/nearby', getNearbyDonors);

module.exports = router;
