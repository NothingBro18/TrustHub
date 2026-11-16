const express = require('express');
const router = express.Router();
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const {
  register, login, logout, getMe, heartbeat, oauthCallback, exchangeOAuthCode, forgotPassword, resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many password reset attempts. Try again later.' },
});
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

router.post('/register', register);
router.post('/login', login);
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/heartbeat', protect, heartbeat);
router.post('/oauth/exchange', exchangeOAuthCode);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.put('/reset-password/:token', passwordResetLimiter, resetPassword);

// Google OAuth
router.get('/google', (req, res, next) => {
  if (passport._strategy('google')) {
    return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  }
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_not_configured`);
});

router.get('/google/callback', (req, res, next) => {
  if (passport._strategy('google')) {
    return passport.authenticate('google', {
      session: false,
      failureRedirect: `${clientUrl}/login?error=oauth`,
    })(req, res, next);
  }
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_not_configured`);
}, oauthCallback);

// GitHub OAuth
router.get('/github', (req, res, next) => {
  if (passport._strategy('github')) {
    return passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
  }
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=github_not_configured`);
});

router.get('/github/callback', (req, res, next) => {
  if (passport._strategy('github')) {
    return passport.authenticate('github', {
      session: false,
      failureRedirect: `${clientUrl}/login?error=oauth`,
    })(req, res, next);
  }
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=github_not_configured`);
}, oauthCallback);

module.exports = router;
