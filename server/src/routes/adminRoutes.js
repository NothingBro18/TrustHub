const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getFlaggedActivities,
  verifyProvider,
  createFlaggedActivity,
  resolveFlaggedActivity,
  deleteFlaggedActivity,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/flagged', getFlaggedActivities);
router.post('/flagged', createFlaggedActivity);
router.put('/flagged/:id/resolve', resolveFlaggedActivity);
router.delete('/flagged/:id', deleteFlaggedActivity);

router.put('/providers/:id/verify', verifyProvider);

module.exports = router;
