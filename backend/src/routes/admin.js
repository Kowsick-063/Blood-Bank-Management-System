const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuth, isAdmin } = require('../middleware/auth');

// All admin routes are protected
router.use(isAuth, isAdmin);

router.get('/stats', adminController.getStats);
router.get('/requests', adminController.getAllRequests);
router.post('/update-request-status', adminController.updateRequestStatus);
router.get('/inventory', adminController.getInventory);
router.get('/inventory-logs', adminController.getInventoryLogs);
router.post('/update-inventory', adminController.updateInventory);
router.get('/donors', adminController.getAllDonors);
router.post('/donors/register', adminController.registerDonor);
router.get('/reports', adminController.getReports);

module.exports = router;
