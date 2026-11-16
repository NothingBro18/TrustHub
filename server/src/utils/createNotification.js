const Notification = require('../models/Notification');

const createNotification = (userId, message, type, link = '') =>
  Notification.create({ userId, message, type, link });

module.exports = createNotification;
