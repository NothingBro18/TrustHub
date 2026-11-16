const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Refresh lastActiveAt and online status (throttled to once per 60 seconds)
    const now = new Date();
    if (!req.user.lastActiveAt || now - new Date(req.user.lastActiveAt) > 60 * 1000 || !req.user.isOnline) {
      User.findByIdAndUpdate(req.user._id, { lastActiveAt: now, isOnline: true }).exec().catch(() => {});
      req.user.lastActiveAt = now;
      req.user.isOnline = true;
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};
