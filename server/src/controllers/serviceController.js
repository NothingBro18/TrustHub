const Provider = require('../models/Provider');
const Service = require('../models/Service');
const mongoose = require('mongoose');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SERVICE_CATEGORIES = ['Home Services', 'Tech Services', 'Vehicle Services', 'Student Services', 'Creative Services', 'Other'];
const areValidTags = (tags) => Array.isArray(tags) && tags.length <= 20 &&
  tags.every((tag) => typeof tag === 'string' && tag.trim() && tag.length <= 40);

const getPagination = (query) => {
  const page = query.page === undefined ? 1 : Number(query.page);
  const requestedLimit = query.limit === undefined ? 20 : Number(query.limit);
  if (!Number.isInteger(page) || page < 1 || page > 100000 ||
      !Number.isInteger(requestedLimit) || requestedLimit < 1) return null;
  const limit = Math.min(100, requestedLimit);
  return { page, limit, skip: (page - 1) * limit };
};

exports.getServices = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    if (!page) return res.status(400).json({ success: false, message: 'Invalid pagination values' });
    const query = { isActive: true };
    const providerIds = await Provider.find({ isVerified: true }).distinct('_id');
    query.providerId = { $in: providerIds };

    if (req.query.providerId) {
      if (!mongoose.isValidObjectId(req.query.providerId)) {
        return res.status(400).json({ success: false, message: 'Invalid provider ID' });
      }
      const provider = await Provider.findOne({ _id: req.query.providerId, isVerified: true }).select('_id');
      if (!provider) return res.status(200).json({ success: true, services: [], total: 0, page, pages: 0 });
      query.providerId = provider._id;
    }
    if (req.query.category && req.query.category !== 'all') {
      if (!SERVICE_CATEGORIES.includes(req.query.category)) {
        return res.status(400).json({ success: false, message: 'Invalid service category' });
      }
      query.category = req.query.category;
    }
    if (req.query.search !== undefined && typeof req.query.search !== 'string') {
      return res.status(400).json({ success: false, message: 'Search must be a string' });
    }
    if (req.query.search?.trim()) {
      const search = new RegExp(escapeRegex(req.query.search.trim()), 'i');
      query.$or = [{ title: search }, { description: search }, { tags: search }];
    }

    const [services, total] = await Promise.all([
      Service.find(query)
        .populate('providerId', 'businessName category location averageRating isVerified')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Service.countDocuments(query),
    ]);

    res.status(200).json({ success: true, services, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

exports.getMyServices = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider profile not found' });

    const services = await Service.find({ providerId: provider._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, services });
  } catch (error) {
    next(error);
  }
};

exports.createService = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider profile not found' });

    const { title, category, description, priceRange, tags } = req.body;
    if (tags !== undefined && !areValidTags(tags)) {
      return res.status(400).json({ success: false, message: 'Tags must be up to 20 non-empty strings of 40 characters or fewer' });
    }
    const service = await Service.create({
      title,
      category,
      description,
      priceRange,
      tags,
      isActive: true,
      providerId: provider._id,
    });
    res.status(201).json({ success: true, service });
  } catch (error) {
    next(error);
  }
};

exports.updateMyService = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid service ID' });
    }
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider profile not found' });

    const updates = {};
    if (req.body.tags !== undefined && !areValidTags(req.body.tags)) {
      return res.status(400).json({ success: false, message: 'Tags must be up to 20 non-empty strings of 40 characters or fewer' });
    }
    ['title', 'category', 'description', 'priceRange', 'tags'].forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    const service = await Service.findOne({ _id: req.params.id, providerId: provider._id });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    Object.assign(service, updates);
    await service.save();
    res.status(200).json({ success: true, service });
  } catch (error) {
    next(error);
  }
};

exports.deactivateMyService = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid service ID' });
    }
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider profile not found' });

    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, providerId: provider._id },
      { isActive: false },
      { new: true }
    );
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.status(200).json({ success: true, service });
  } catch (error) {
    next(error);
  }
};

exports.getAdminServices = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    if (!page) return res.status(400).json({ success: false, message: 'Invalid pagination values' });
    const query = {};
    if (req.query.isActive === 'true' || req.query.isActive === 'false') {
      query.isActive = req.query.isActive === 'true';
    } else if (req.query.isActive !== undefined && req.query.isActive !== 'all') {
      return res.status(400).json({ success: false, message: 'isActive must be true, false, or all' });
    }
    if (req.query.search !== undefined && typeof req.query.search !== 'string') {
      return res.status(400).json({ success: false, message: 'Search must be a string' });
    }
    if (req.query.search?.trim()) {
      const search = new RegExp(escapeRegex(req.query.search.trim()), 'i');
      query.$or = [{ title: search }, { description: search }];
    }

    const [services, total] = await Promise.all([
      Service.find(query)
        .populate('providerId', 'businessName isVerified')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Service.countDocuments(query),
    ]);
    res.status(200).json({ success: true, services, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

exports.updateServiceModeration = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid service ID' });
    }
    if (typeof req.body.isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean' });
    }
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true, runValidators: true }
    ).populate('providerId', 'businessName isVerified');
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.status(200).json({ success: true, service });
  } catch (error) {
    next(error);
  }
};
