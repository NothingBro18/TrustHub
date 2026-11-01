const express = require('express');
const router = express.Router();
const { getMe, updateMe, toggleSavedProvider, getCustomerDashboard } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.get('/me', protect, getMe);
router.put('/me', protect, upload.single('avatar'), updateMe);
router.put('/saved-providers/:providerId', protect, authorize('customer'), toggleSavedProvider);
router.get('/dashboard', protect, authorize('customer'), getCustomerDashboard);

module.exports = router;
