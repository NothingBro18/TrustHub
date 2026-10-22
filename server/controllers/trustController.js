import mongoose from 'mongoose';
import Trust from '../models/Trust.js';

const editableFields = [
  'trustName',
  'trusteeName',
  'contactEmail',
  'contactPhone',
  'trustType',
];

const isValidId = (id) => mongoose.isValidObjectId(id);

export const createTrust = async (req, res, next) => {
  if (req.user.isGuest) {
    return res.status(403).json({ message: 'Guest accounts are read-only' });
  }

  try {
    const trust = await Trust.create({
      ...Object.fromEntries(editableFields
        .filter((field) => req.body?.[field] !== undefined)
        .map((field) => [field, req.body[field]])),
      createdBy: req.user._id,
    });

    return res.status(201).json({ trust });
  } catch (error) {
    return next(error);
  }
};

export const getTrusts = async (req, res, next) => {
  try {
    const filter = req.user.role === 'Admin' ? {} : { createdBy: req.user._id };
    const trusts = await Trust.find(filter).sort({ createdAt: -1 });
    return res.json({ trusts });
  } catch (error) {
    return next(error);
  }
};

export const updateTrust = async (req, res, next) => {
  if (req.user.isGuest) {
    return res.status(403).json({ message: 'Guest accounts are read-only' });
  }

  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid trust id' });
    }

    const filter = { _id: req.params.id };
    if (req.user.role !== 'Admin') filter.createdBy = req.user._id;

    const updates = Object.fromEntries(editableFields
      .filter((field) => req.body?.[field] !== undefined)
      .map((field) => [field, req.body[field]]));

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No editable trust fields provided' });
    }

    const trust = await Trust.findOneAndUpdate(filter, updates, {
      new: true,
      runValidators: true,
    });
    if (!trust) return res.status(404).json({ message: 'Trust not found' });

    return res.json({ trust });
  } catch (error) {
    return next(error);
  }
};

export const updateVerificationStatus = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid trust id' });
    }

    const { verificationStatus } = req.body ?? {};
    if (!['Verified', 'Rejected'].includes(verificationStatus)) {
      return res.status(400).json({ message: 'Status must be Verified or Rejected' });
    }

    const trust = await Trust.findByIdAndUpdate(req.params.id, {
      $set: { verificationStatus },
      $push: {
        statusHistory: {
          status: verificationStatus,
          changedBy: req.user._id,
          timestamp: new Date(),
        },
      },
    }, { new: true, runValidators: true });

    if (!trust) return res.status(404).json({ message: 'Trust not found' });
    return res.json({ trust });
  } catch (error) {
    return next(error);
  }
};