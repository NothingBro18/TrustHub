const express = require('express');
const { createReview, getMyReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.get('/mine', authorize('customer', 'provider'), getMyReviews);
router.post('/', authorize('customer'), createReview);

module.exports = router;
