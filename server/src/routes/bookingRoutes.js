const express = require('express');
const router = express.Router();
const {
  createBooking, getMyBookings, getProviderBookings, updateBookingStatus, getBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.post('/', protect, authorize('customer'), upload.array('images', 5), createBooking);
router.get('/my', protect, authorize('customer'), getMyBookings);
router.get('/provider', protect, authorize('provider'), getProviderBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/status', protect, authorize('provider', 'admin'), updateBookingStatus);

module.exports = router;
