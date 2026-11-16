const User = require('../models/User');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const mongoose = require('mongoose');

// @desc    Get own profile
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-resetPasswordToken -resetPasswordExpire -oauthId')
      .populate('savedProviders');
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update own profile
// @route   PUT /api/users/me
// @access  Private
exports.updateMe = async (req, res, next) => {
  try {
    const { name, phone, location } = req.body;
    if (name !== undefined && (typeof name !== 'string' || !name.trim() || name.trim().length > 50)) {
      return res.status(400).json({ success: false, message: 'Name must be between 1 and 50 characters' });
    }
    if (phone !== undefined && (typeof phone !== 'string' || phone.length > 30)) {
      return res.status(400).json({ success: false, message: 'Phone must be 30 characters or fewer' });
    }
    if (location !== undefined && (!location || typeof location !== 'object' || Array.isArray(location) ||
      Object.keys(location).some((key) => !['city', 'state'].includes(key)) ||
      Object.values(location).some((value) => typeof value !== 'string' || value.length > 80))) {
      return res.status(400).json({ success: false, message: 'Location must contain valid city and state strings' });
    }

    const user = await User.findById(req.user.id).select('-resetPasswordToken -resetPasswordExpire -oauthId');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (location !== undefined) {
      user.location = user.location || {};
      if (location.city !== undefined) user.location.city = location.city.trim();
      if (location.state !== undefined) user.location.state = location.state.trim();
    }
    if (req.file) user.avatar = `/uploads/${req.file.filename}`;
    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Save / unsave a provider
// @route   PUT /api/users/saved-providers/:providerId
// @access  Private (Customer)
exports.toggleSavedProvider = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-resetPasswordToken -resetPasswordExpire -oauthId');
    const { providerId } = req.params;
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!mongoose.isValidObjectId(providerId)) {
      return res.status(400).json({ success: false, message: 'Invalid provider ID' });
    }
    const provider = await Provider.findOne({ _id: providerId, isVerified: true }).select('_id');
    if (!provider) return res.status(404).json({ success: false, message: 'Verified provider not found' });
    const index = user.savedProviders.findIndex((savedProviderId) => savedProviderId.toString() === providerId);

    if (index === -1) {
      user.savedProviders.push(providerId);
    } else {
      user.savedProviders.splice(index, 1);
    }
    await user.save();
    res.status(200).json({ success: true, savedProviders: user.savedProviders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer dashboard stats
// @route   GET /api/users/dashboard
// @access  Private (Customer)
exports.getCustomerDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [activeBookings, completedBookings, user, customerRating, bookingActivity] = await Promise.all([
      Booking.countDocuments({ customerId: userId, status: { $in: ['pending', 'accepted', 'in_progress'] } }),
      Booking.countDocuments({ customerId: userId, status: 'completed' }),
      User.findById(userId).populate('savedProviders', 'businessName averageRating category'),
      Review.aggregate([
        { $match: { customerId: userId } },
        { $group: { _id: null, average: { $avg: '$rating' } } },
      ]),
      Booking.aggregate([
        { $match: { customerId: userId, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, bookings: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const recentBookings = await Booking.find({ customerId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('providerId', 'businessName')
      .populate('serviceId', 'title');

    res.status(200).json({
      success: true,
      stats: {
        activeBookings,
        completedServices: completedBookings,
        savedProviders: user.savedProviders.length,
        averageRating: Number((customerRating[0]?.average || 0).toFixed(1)),
      },
      recentBookings,
      savedProviders: user.savedProviders,
      bookingActivity: bookingActivity.map((item) => ({ date: item._id, bookings: item.bookings })),
    });
  } catch (error) {
    next(error);
  }
};
