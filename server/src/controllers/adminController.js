const User = require('../models/User');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');
const FlaggedActivity = require('../models/FlaggedActivity');
const Review = require('../models/Review');
const Message = require('../models/Message');
const Service = require('../models/Service');
const mongoose = require('mongoose');
const createNotification = require('../utils/createNotification');
const logger = require('../utils/logger');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const getPagination = (pageValue, limitValue) => {
  const page = Number(pageValue);
  const requestedLimit = Number(limitValue);
  if ((pageValue !== undefined && (!Number.isInteger(page) || page < 1)) ||
      (limitValue !== undefined && (!Number.isInteger(requestedLimit) || requestedLimit < 1))) {
    return null;
  }
  const limit = Math.min(requestedLimit || 20, 100);
  return { page: page || 1, limit, skip: ((page || 1) - 1) * limit };
};

// @desc    Get system overview stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStats = async (req, res, next) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const [totalUsers, verifiedProviders, activeBookings, flaggedCount, onlineUsers] = await Promise.all([
      User.countDocuments(),
      Provider.countDocuments({ isVerified: true }),
      Booking.countDocuments({ status: { $in: ['pending', 'accepted', 'in_progress'] } }),
      FlaggedActivity.countDocuments({ resolved: false }),
      User.countDocuments({ isOnline: true, lastActiveAt: { $gte: fiveMinutesAgo } }),
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
      stats: { totalUsers, onlineUsers, verifiedProviders, activeBookings, flaggedActivities: flaggedCount },
      userRegistrations,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProviders = async (req, res, next) => {
  try {
    const pagination = getPagination(req.query.page, req.query.limit);
    if (!pagination) return res.status(400).json({ success: false, message: 'Invalid pagination values' });
    const query = {};
    if (req.query.status && req.query.status !== 'all') {
      if (!['pending', 'approved', 'rejected'].includes(req.query.status)) {
        return res.status(400).json({ success: false, message: 'Invalid provider verification status filter' });
      }
      query.verificationStatus = req.query.status;
    }
    const [providers, total] = await Promise.all([
      Provider.find(query)
        .populate('userId', 'name email phone avatar')
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Provider.countDocuments(query),
    ]);
    res.status(200).json({ success: true, providers, total, page: pagination.page, pages: Math.ceil(total / pagination.limit) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, isVerified, status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    const pagination = getPagination(page, limit);
    if (!pagination) return res.status(400).json({ success: false, message: 'Invalid pagination values' });
    if (role && role !== 'all') {
      if (!['customer', 'provider', 'admin'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid user role filter' });
      }
      query.role = role;
    }
    if (isVerified !== undefined && isVerified !== 'all') {
      if (!['true', 'false'].includes(isVerified)) {
        return res.status(400).json({ success: false, message: 'isVerified must be true, false, or all' });
      }
      query.isVerified = isVerified === 'true';
    }
    if (status && !['online', 'offline', 'all'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid user status filter' });
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (status === 'online') {
      query.isOnline = true;
      query.lastActiveAt = { $gte: fiveMinutesAgo };
    } else if (status === 'offline') {
      query.$or = [
        { isOnline: false },
        { lastActiveAt: { $lt: fiveMinutesAgo } },
        { lastActiveAt: null },
      ];
    }

    if (search && typeof search !== 'string') {
      return res.status(400).json({ success: false, message: 'Search must be a string' });
    }
    if (search && search.trim()) {
      const reg = new RegExp(escapeRegex(search.trim()), 'i');
      const searchOr = [{ name: reg }, { email: reg }, { 'location.city': reg }];
      if (query.$or) {
        const existingOr = query.$or;
        delete query.$or;
        query.$and = [{ $or: existingOr }, { $or: searchOr }];
      } else {
        query.$or = searchOr;
      }
    }

    const [rawUsers, total] = await Promise.all([User.find(query)
      .select('-resetPasswordToken -resetPasswordExpire -oauthId')
      .sort({ isOnline: -1, lastActiveAt: -1, createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),
    User.countDocuments(query)]);
    const onlineCount = await User.countDocuments({
      isOnline: true,
      lastActiveAt: { $gte: fiveMinutesAgo },
    });

    const users = rawUsers.map((u) => {
      const uObj = u.toObject();
      const isRecentlyActive = uObj.lastActiveAt && new Date(uObj.lastActiveAt) >= fiveMinutesAgo;
      uObj.isOnline = Boolean(uObj.isOnline && isRecentlyActive);
      return uObj;
    });

    res.status(200).json({ success: true, users, total, onlineCount, page: pagination.page, pages: Math.ceil(total / pagination.limit) });
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
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    if (role !== undefined && !['customer', 'provider', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid user role' });
    }
    if (isVerified !== undefined && typeof isVerified !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Verification status must be a boolean' });
    }
    if (name !== undefined && (typeof name !== 'string' || !name.trim() || name.trim().length > 50)) {
      return res.status(400).json({ success: false, message: 'Name must be between 1 and 50 characters' });
    }
    if (email !== undefined && (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address' });
    }
    if (phone !== undefined && (typeof phone !== 'string' || phone.length > 30)) {
      return res.status(400).json({ success: false, message: 'Phone must be 30 characters or fewer' });
    }
    if (role !== undefined && req.params.id === req.user.id.toString() && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot remove your own admin role' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const previousRole = user.role;

    if (role !== undefined) user.role = role;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (phone !== undefined) user.phone = phone.trim();

    await user.save();
    if (role !== undefined && role !== previousRole) {
      if (role === 'provider') {
        await Provider.updateOne(
          { userId: user._id },
          {
            $set: { verificationStatus: 'pending', isVerified: false },
            $setOnInsert: { businessName: user.name, category: 'Other' },
          },
          { upsert: true, runValidators: true }
        );
      } else if (previousRole === 'provider') {
        await Provider.updateOne(
          { userId: user._id },
          { $set: { verificationStatus: 'pending', isVerified: false } }
        );
      }
    }
    const safeUser = user.toObject();
    delete safeUser.resetPasswordToken;
    delete safeUser.resetPasswordExpire;
    delete safeUser.oauthId;
    res.status(200).json({ success: true, user: safeUser });
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
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const provider = await Provider.findOne({ userId: user._id }).select('_id');
    const [bookings, reviews, messages, services, flags] = await Promise.all([
      Booking.countDocuments({ $or: [{ customerId: user._id }, ...(provider ? [{ providerId: provider._id }] : [])] }),
      Review.countDocuments({ $or: [{ customerId: user._id }, ...(provider ? [{ providerId: provider._id }] : [])] }),
      Message.countDocuments({ $or: [{ senderId: user._id }, { receiverId: user._id }] }),
      provider ? Service.countDocuments({ providerId: provider._id }) : 0,
      FlaggedActivity.countDocuments({ userId: user._id }),
    ]);
    if (bookings + reviews + messages + services + flags > 0) {
      return res.status(409).json({
        success: false,
        message: 'This account has marketplace history and cannot be deleted without removing related records.',
      });
    }
    if (provider) await provider.deleteOne();
    await user.deleteOne();
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
    const pagination = getPagination(page, limit);
    if (!pagination) return res.status(400).json({ success: false, message: 'Invalid pagination values' });
    const query = {};
    if (resolved !== undefined && resolved !== 'all') {
      if (!['true', 'false'].includes(resolved)) {
        return res.status(400).json({ success: false, message: 'Resolved filter must be true, false, or all' });
      }
      query.resolved = resolved === 'true';
    }
    if (severity && severity !== 'all') {
      if (!['low', 'medium', 'high'].includes(severity)) {
        return res.status(400).json({ success: false, message: 'Invalid severity filter' });
      }
      query.severity = severity;
    }
    if (type && type !== 'all') {
      if (!['unusual_review', 'suspicious_account', 'multiple_reviews', 'failed_login', 'other'].includes(type)) {
        return res.status(400).json({ success: false, message: 'Invalid activity type filter' });
      }
      query.type = type;
    }
    if (search && typeof search !== 'string') {
      return res.status(400).json({ success: false, message: 'Search must be a string' });
    }
    if (search && search.trim()) {
      query.description = { $regex: escapeRegex(search.trim()), $options: 'i' };
    }

    const [activities, total] = await Promise.all([FlaggedActivity.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate('userId', 'name email role avatar')
      .populate('resolvedBy', 'name email'),
    FlaggedActivity.countDocuments(query)]);
    res.status(200).json({ success: true, activities, total, page: pagination.page, pages: Math.ceil(total / pagination.limit) });
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
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid provider ID' });
    }
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Verification status must be pending, approved, or rejected' });
    }
    const allowedDetails = ['identityVerified', 'contactVerified', 'servicesVerified', 'positiveReviewHistory'];
    if (verificationDetails !== undefined && (!verificationDetails || typeof verificationDetails !== 'object' ||
      Array.isArray(verificationDetails) || Object.entries(verificationDetails).some(([key, value]) =>
        !allowedDetails.includes(key) || typeof value !== 'boolean'))) {
      return res.status(400).json({ success: false, message: 'Verification details must contain only supported boolean checks' });
    }
    const previousProvider = await Provider.findById(req.params.id).select('verificationStatus');
    if (!previousProvider) return res.status(404).json({ success: false, message: 'Provider not found' });
    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: status,
        isVerified: status === 'approved',
        ...(verificationDetails ? { verificationDetails } : {}),
      },
      { new: true, runValidators: true }
    );
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });
    let notificationWarning;
    if (previousProvider.verificationStatus !== status) {
      try {
        await createNotification(
          provider.userId,
          status === 'approved'
            ? 'Your provider profile was approved. Active services can now receive customer booking requests.'
            : `Your provider verification status was updated to ${status}.`,
          'system',
          '/provider/dashboard'
        );
      } catch (error) {
        logger.error('Provider verification notification could not be created', {
          providerId: provider._id.toString(),
          error: error.message,
        });
        notificationWarning = 'Provider status was updated, but its notification could not be sent.';
      }
    }
    res.status(200).json({ success: true, provider, ...(notificationWarning ? { warning: notificationWarning } : {}) });
  } catch (error) {
    next(error);
  }
};

// @desc    Flag an activity
// @route   POST /api/admin/flagged
// @access  Private (Admin)
exports.createFlaggedActivity = async (req, res, next) => {
  try {
    const { type, userId, description, severity } = req.body;
    if (userId !== undefined && !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    if (typeof description !== 'string' || !description.trim() || description.trim().length > 2000) {
      return res.status(400).json({ success: false, message: 'Description must be between 1 and 2000 characters' });
    }
    if (severity !== undefined && !['low', 'medium', 'high'].includes(severity)) {
      return res.status(400).json({ success: false, message: 'Invalid severity' });
    }
    if (userId && !await User.exists({ _id: userId })) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const activity = await FlaggedActivity.create({ type, userId, description: description.trim(), severity });
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
    if (typeof resolved !== 'boolean' || !mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Provide a valid activity ID and boolean resolution state' });
    }
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
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid activity ID' });
    }
    const activity = await FlaggedActivity.findByIdAndDelete(req.params.id);
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });
    res.status(200).json({ success: true, message: 'Flagged activity deleted' });
  } catch (error) {
    next(error);
  }
};
