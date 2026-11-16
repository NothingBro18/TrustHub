const User = require('../models/User');
const Provider = require('../models/Provider');
const { generateToken, sendTokenResponse } = require('../utils/generateToken');
const crypto = require('crypto');
const { isEmailConfigured, sendEmail } = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!['customer', 'provider'].includes(role || 'customer')) {
      return res.status(400).json({ success: false, message: 'Role must be customer or provider' });
    }

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: role || 'customer',
      lastLoginAt: new Date(),
      lastActiveAt: new Date(),
      isOnline: true,
    });

    // If registering as provider, create a Provider record
    if (role === 'provider') {
      await Provider.create({
        userId: user._id,
        businessName: name,
        category: 'Other',
      });
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { password } = req.body;
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || user.oauthProvider !== 'local' || !user.password || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Record login timestamp and mark user online
    const now = new Date();
    await User.findByIdAndUpdate(user._id, {
      lastLoginAt: now,
      lastActiveAt: now,
      isOnline: true,
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        isOnline: false,
        lastActiveAt: new Date(),
      });
    }
    res.cookie('token', '', { expires: new Date(0), httpOnly: true });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-resetPasswordToken -resetPasswordExpire -oauthId');
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Heartbeat to keep active online status refreshed
// @route   POST /api/auth/heartbeat
// @access  Private
exports.heartbeat = async (req, res, next) => {
  try {
    const now = new Date();
    await User.findByIdAndUpdate(req.user._id, {
      lastActiveAt: now,
      isOnline: true,
    });
    res.status(200).json({ success: true, lastActiveAt: now });
  } catch (error) {
    next(error);
  }
};

// @desc    OAuth callback - send token
// @route   Used internally after OAuth
exports.oauthCallback = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth`);
    }
    const now = new Date();
    await User.findByIdAndUpdate(req.user._id, {
      lastLoginAt: now,
      lastActiveAt: now,
      isOnline: true,
    });
    const code = crypto.randomBytes(32).toString('hex');
    await User.findByIdAndUpdate(req.user._id, {
      oauthLoginCodeHash: crypto.createHash('sha256').update(code).digest('hex'),
      oauthLoginCodeExpire: new Date(Date.now() + 2 * 60 * 1000),
    });
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/oauth/callback#code=${code}`);
  } catch (error) {
    next(error);
  }
};

exports.exchangeOAuthCode = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (typeof code !== 'string' || !/^[a-f0-9]{64}$/i.test(code)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OAuth login code' });
    }

    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const now = new Date();
    const user = await User.findOneAndUpdate(
      { oauthLoginCodeHash: codeHash, oauthLoginCodeExpire: { $gt: now } },
      {
        $unset: { oauthLoginCodeHash: 1, oauthLoginCodeExpire: 1 },
        $set: { lastLoginAt: now, lastActiveAt: now, isOnline: true },
      },
      { new: true }
    );
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired OAuth login code' });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address' });
    }
    if (!isEmailConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Password reset email is unavailable until SMTP is configured.',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ success: true, message: 'If that account exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset your TrustHub password',
        text: `Use this link to reset your TrustHub password. It expires in 10 minutes: ${resetUrl}`,
        html: `<p>Use the link below to reset your TrustHub password. It expires in 10 minutes.</p><p><a href="${resetUrl}">Reset password</a></p>`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      throw error;
    }
    res.status(200).json({ success: true, message: 'If that account exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    if (typeof req.params.token !== 'string' || !/^[a-f0-9]{40}$/i.test(req.params.token)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }
    if (typeof req.body.password !== 'string' || req.body.password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};
