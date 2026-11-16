const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const Review = require('../models/Review');
const createNotification = require('../utils/createNotification');
const mongoose = require('mongoose');

exports.createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment = '' } = req.body;
    const numericRating = Number(rating);
    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({ success: false, message: 'A valid booking ID is required' });
    }
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be a whole number from 1 to 5' });
    }
    if (typeof comment !== 'string' || comment.length > 2000) {
      return res.status(400).json({ success: false, message: 'Review text must be 2000 characters or fewer' });
    }
    const booking = await Booking.findOne({
      _id: bookingId,
      customerId: req.user.id,
      status: 'completed',
    });
    if (!booking) {
      return res.status(400).json({ success: false, message: 'Only your completed bookings can be reviewed' });
    }

    const review = await Review.create({
      bookingId: booking._id,
      customerId: req.user.id,
      providerId: booking.providerId,
      rating: numericRating,
      comment: comment.trim(),
    });

    const [ratingStats, count] = await Promise.all([
      Review.aggregate([
        { $match: { providerId: booking.providerId } },
        { $group: { _id: null, averageRating: { $avg: '$rating' } } },
      ]),
      Review.countDocuments({ providerId: booking.providerId }),
    ]);
    await Provider.findByIdAndUpdate(booking.providerId, {
      averageRating: Number((ratingStats[0]?.averageRating || 0).toFixed(2)),
      totalReviews: count,
    });
    const provider = await Provider.findById(booking.providerId).select('userId');
    await createNotification(provider.userId, 'A customer left a review for your service', 'review', '/provider/reviews');

    const populatedReview = await Review.findById(review._id).populate('customerId', 'name avatar');
    res.status(201).json({ success: true, review: populatedReview });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'This booking has already been reviewed' });
    }
    next(error);
  }
};

exports.getMyReviews = async (req, res, next) => {
  try {
    const query = req.user.role === 'provider'
      ? { providerId: (await Provider.findOne({ userId: req.user.id }))?._id }
      : { customerId: req.user.id };
    if (!query.providerId && req.user.role === 'provider') {
      return res.status(200).json({ success: true, reviews: [] });
    }

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .populate('customerId', 'name avatar')
      .populate('providerId', 'businessName')
      .populate('bookingId', 'serviceType serviceId scheduledDate');
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};
