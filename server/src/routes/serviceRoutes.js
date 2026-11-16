const express = require('express');
const {
  getServices,
  getMyServices,
  createService,
  updateMyService,
  deactivateMyService,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', getServices);
router.get('/mine', protect, authorize('provider'), getMyServices);
router.post('/', protect, authorize('provider'), createService);
router.put('/:id', protect, authorize('provider'), updateMyService);
router.delete('/:id', protect, authorize('provider'), deactivateMyService);

module.exports = router;
