const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createRequest, getMyRequests, getRequestById } = require('../controllers/requestController');

// All request routes require authentication
router.use(protect);

// POST /api/requests
router.post('/', createRequest);

// GET /api/requests/my
router.get('/my', getMyRequests);

// GET /api/requests/:id
router.get('/:id', getRequestById);

module.exports = router;
