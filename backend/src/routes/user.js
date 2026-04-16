const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuth } = require('../middleware/auth');

// All user routes are protected
router.use(isAuth);

router.get('/profile', userController.getProfile);
router.post('/update-profile', userController.updateProfile);
router.get('/stats', userController.getUserStats);
router.post('/request-blood', userController.requestBlood);
router.post('/donate', userController.donateBlood);
router.get('/history', userController.getHistory);
router.get('/notifications', require('../controllers/adminController').getNotifications);

module.exports = router;
