const User = require('../models/User');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');
const FlaggedActivity = require('../models/FlaggedActivity');
const Review = require('../models/Review');

// @desc    Get system overview stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, verifiedProviders, activeBookings, flaggedCount] = await Promise.all([
      User.countDocuments(),
      Provider.countDocuments({ isVerified: true }),
      Booking.countDocuments({ status: { $in: ['pending', 'accepted', 'in_progress'] } }),
      FlaggedActivity.countDocuments({ resolved: false }),
    ]);

    // User registrations per day for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const userRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: { totalUsers, verifiedProviders, activeBookings, flaggedActivities: flaggedCount },
      userRegistrations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, isVerified, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role && role !== 'all') query.role = role;
    if (isVerified !== undefined && isVerified !== 'all') {
      query.isVerified = isVerified === 'true';
    }
    if (search && search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ name: reg }, { email: reg }, { 'location.city': reg }];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments(query);
    res.status(200).json({ success: true, users, total });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details / role / verification
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, isVerified, phone } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (role && ['customer', 'provider', 'admin'].includes(role)) user.role = role;
    if (isVerified !== undefined) user.isVerified = Boolean(isVerified);
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;

    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all flagged activities
// @route   GET /api/admin/flagged
// @access  Private (Admin)
exports.getFlaggedActivities = async (req, res, next) => {
  try {
    const { resolved, severity, type, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (resolved !== undefined && resolved !== 'all') query.resolved = resolved === 'true';
    if (severity && severity !== 'all') query.severity = severity;
    if (type && type !== 'all') query.type = type;
    if (search && search.trim()) {
      query.description = { $regex: search.trim(), $options: 'i' };
    }

    const activities = await FlaggedActivity.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('userId', 'name email role avatar')
      .populate('resolvedBy', 'name email');
    const total = await FlaggedActivity.countDocuments(query);
    res.status(200).json({ success: true, activities, total });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify a provider
// @route   PUT /api/admin/providers/:id/verify
// @access  Private (Admin)
exports.verifyProvider = async (req, res, next) => {
  try {
    const { status, verificationDetails } = req.body;
    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: status,
        isVerified: status === 'approved',
        verificationDetails,
      },
      { new: true }
    );
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });
    res.status(200).json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};

// @desc    Flag an activity
// @route   POST /api/admin/flagged
// @access  Private (Admin)
exports.createFlaggedActivity = async (req, res, next) => {
  try {
    const activity = await FlaggedActivity.create(req.body);
    res.status(201).json({ success: true, activity });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve or unresolve a flagged activity
// @route   PUT /api/admin/flagged/:id/resolve
// @access  Private (Admin)
exports.resolveFlaggedActivity = async (req, res, next) => {
  try {
    const { resolved = true } = req.body || {};
    const updates = resolved
      ? { resolved: true, resolvedBy: req.user.id, resolvedAt: new Date() }
      : { resolved: false, resolvedBy: null, resolvedAt: null };

    const activity = await FlaggedActivity.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('userId', 'name email role avatar').populate('resolvedBy', 'name email');

    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });
    res.status(200).json({ success: true, activity });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a flagged activity
// @route   DELETE /api/admin/flagged/:id
// @access  Private (Admin)
exports.deleteFlaggedActivity = async (req, res, next) => {
  try {
    const activity = await FlaggedActivity.findByIdAndDelete(req.params.id);
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });
    res.status(200).json({ success: true, message: 'Flagged activity deleted' });
  } catch (error) {
    next(error);
  }
};
