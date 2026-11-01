const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  register, login, logout, getMe, oauthCallback, forgotPassword, resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Google OAuth
router.get('/google', (req, res, next) => {
  if (passport._strategy('google')) {
    return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  }
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_not_configured`);
});

router.get('/google/callback', (req, res, next) => {
  if (passport._strategy('google')) {
    return passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }, oauthCallback)(req, res, next);
  }
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_not_configured`);
});

// GitHub OAuth
router.get('/github', (req, res, next) => {
  if (passport._strategy('github')) {
    return passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
  }
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=github_not_configured`);
});

router.get('/github/callback', (req, res, next) => {
  if (passport._strategy('github')) {
    return passport.authenticate('github', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }, oauthCallback)(req, res, next);
  }
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=github_not_configured`);
});

module.exports = router;
