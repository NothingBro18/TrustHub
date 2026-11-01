const express = require('express');
const router = express.Router();
const {
  getProviders, getProvider, updateProviderProfile, getProviderDashboard,
} = require('../controllers/providerController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/', getProviders);
router.get('/dashboard', protect, authorize('provider'), getProviderDashboard);
router.get('/:id', getProvider);
router.put('/me', protect, authorize('provider'), updateProviderProfile);

module.exports = router;
