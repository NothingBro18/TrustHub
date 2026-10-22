import { randomBytes } from 'node:crypto';
import User from '../models/User.js';
import Trust from '../models/Trust.js';
import generateToken from '../utils/generateToken.js';

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isGuest: user.isGuest,
});

export const register = async (req, res, next) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = req.body?.password;

    if (!name || !email || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const user = await User.create({ name, email, password });
    return res.status(201).json({
      token: generateToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email is already registered' });
    }
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = req.body?.password;

    if (!email || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({
      token: generateToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

export const guestLogin = async (req, res, next) => {
  if (process.env.ENABLE_GUEST_LOGIN !== 'true') {
    return res.status(404).json({ message: 'Guest access is not enabled' });
  }

  try {
    const email = (process.env.GUEST_EMAIL || 'guest@trusthub.demo').trim().toLowerCase();
    let guest = await User.findOne({ email });

    if (guest && !guest.isGuest) {
      return res.status(409).json({ message: 'Guest email conflicts with a registered account' });
    }

    if (!guest) {
      try {
        guest = await User.create({
          name: 'TrustHub Guest',
          email,
          password: randomBytes(32).toString('hex'),
          isGuest: true,
        });
      } catch (error) {
        if (error.code !== 11000) throw error;
        guest = await User.findOne({ email });
        if (!guest?.isGuest) throw error;
      }
    }

    const hasSampleTrusts = await Trust.exists({ createdBy: guest._id });
    if (!hasSampleTrusts) {
      await Trust.insertMany([
        {
          trustName: 'Cedar Grove Family Trust',
          trusteeName: 'Morgan Ellis',
          contactEmail: 'morgan.ellis@example.com',
          contactPhone: '+1 202-555-0142',
          trustType: 'Family',
          verificationStatus: 'Verified',
          createdBy: guest._id,
        },
        {
          trustName: 'Northstar Community Foundation',
          trusteeName: 'Jordan Lee',
          contactEmail: 'jordan.lee@example.com',
          contactPhone: '+1 202-555-0176',
          trustType: 'Charitable',
          verificationStatus: 'Pending',
          createdBy: guest._id,
        },
      ]);
    }

    return res.json({ token: generateToken(guest), user: publicUser(guest) });
  } catch (error) {
    return next(error);
  }
};

export const getMe = (req, res) => res.json({ user: publicUser(req.user) });