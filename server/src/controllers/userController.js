const User = require('../models/User');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');

// @desc    Get own profile
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('savedProviders');
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
    const allowedFields = ['name', 'phone', 'location', 'avatar'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (req.file) updates.avatar = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
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
    const user = await User.findById(req.user.id);
    const { providerId } = req.params;
    const index = user.savedProviders.indexOf(providerId);

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
    const [activeBookings, completedBookings, user] = await Promise.all([
      Booking.countDocuments({ customerId: userId, status: { $in: ['pending', 'accepted', 'in_progress'] } }),
      Booking.countDocuments({ customerId: userId, status: 'completed' }),
      User.findById(userId).populate('savedProviders', 'businessName averageRating category'),
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
      },
      recentBookings,
      savedProviders: user.savedProviders,
    });
  } catch (error) {
    next(error);
  }
};
