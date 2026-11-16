require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// Only register Google strategy if valid credentials exist
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id' &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret'
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('Google did not provide an email address'), null);
          let user = await User.findOne({ email });
          if (!user) {
            user = await User.create({
              name: profile.displayName || email.split('@')[0],
              email,
              avatar: profile.photos?.[0]?.value,
              oauthProvider: 'google',
              oauthId: profile.id,
              isVerified: true,
            });
          }
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

// Only register GitHub strategy if valid credentials exist
if (
  process.env.GITHUB_CLIENT_ID &&
  process.env.GITHUB_CLIENT_ID !== 'your_github_client_id' &&
  process.env.GITHUB_CLIENT_SECRET &&
  process.env.GITHUB_CLIENT_SECRET !== 'your_github_client_secret'
) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: '/api/auth/github/callback',
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('GitHub did not provide an email address'), null);
          let user = await User.findOne({ email });
          if (!user) {
            user = await User.create({
              name: profile.displayName || profile.username,
              email,
              avatar: profile.photos?.[0]?.value,
              oauthProvider: 'github',
              oauthId: profile.id,
              isVerified: true,
            });
          }
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
