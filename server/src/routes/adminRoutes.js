const express = require('express');
const router = express.Router();
const {
  getStats,
  getProviders,
  getAllUsers,
  updateUser,
  deleteUser,
  getFlaggedActivities,
  verifyProvider,
  createFlaggedActivity,
  resolveFlaggedActivity,
  deleteFlaggedActivity,
} = require('../controllers/adminController');
const { getAdminServices, updateServiceModeration } = require('../controllers/serviceController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/providers', getProviders);
router.get('/services', getAdminServices);
router.patch('/services/:id', updateServiceModeration);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/flagged', getFlaggedActivities);
router.post('/flagged', createFlaggedActivity);
router.put('/flagged/:id/resolve', resolveFlaggedActivity);
router.delete('/flagged/:id', deleteFlaggedActivity);

router.put('/providers/:id/verify', verifyProvider);

module.exports = router;
