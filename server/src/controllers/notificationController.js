const Notification = require('../models/Notification');
const mongoose = require('mongoose');

exports.getNotifications = async (req, res, next) => {
  try {
    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    const requestedLimit = req.query.limit === undefined ? 30 : Number(req.query.limit);
    if (!Number.isInteger(page) || page < 1 || page > 100000 ||
        !Number.isInteger(requestedLimit) || requestedLimit < 1) {
      return res.status(400).json({ success: false, message: 'Invalid pagination values' });
    }
    const limit = Math.min(100, requestedLimit);
    const [notifications, unreadCount, total] = await Promise.all([
      Notification.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Notification.countDocuments({ userId: req.user.id, isRead: false }),
      Notification.countDocuments({ userId: req.user.id }),
    ]);
    res.status(200).json({ success: true, notifications, unreadCount, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

exports.markNotificationRead = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.status(200).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

exports.markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};
