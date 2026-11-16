const Provider = require('../models/Provider');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Service = require('../models/Service');
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get all providers (with search & filter)
// @route   GET /api/providers
// @access  Public
exports.getProviders = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, rating, sort = 'rating', page = 1, limit = 50 } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > 100000 ||
        !Number.isInteger(limitNumber) || limitNumber < 1) {
      return res.status(400).json({ success: false, message: 'Invalid pagination values' });
    }
    if (search !== undefined && (typeof search !== 'string' || search.length > 120)) {
      return res.status(400).json({ success: false, message: 'Search must be a string of 120 characters or fewer' });
    }
    if (category !== undefined && category !== 'All' && category !== 'all' &&
        !['Home Services', 'Tech Services', 'Vehicle Services', 'Student Services', 'Creative Services', 'Other'].includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid provider category' });
    }
    if (!['rating', 'completed', 'price_asc'].includes(sort)) {
      return res.status(400).json({ success: false, message: 'Invalid provider sort option' });
    }
    const isPrice = (value) => value === undefined || (value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0);
    if (!isPrice(minPrice) || !isPrice(maxPrice) ||
        (minPrice !== undefined && maxPrice !== undefined && Number(minPrice) > Number(maxPrice))) {
      return res.status(400).json({ success: false, message: 'Price filters must be non-negative and minimum cannot exceed maximum' });
    }
    if (rating !== undefined && rating !== 'any' &&
        (!Number.isFinite(Number(rating)) || Number(rating) < 0 || Number(rating) > 5)) {
      return res.status(400).json({ success: false, message: 'Rating must be between 0 and 5' });
    }
    const safePage = pageNumber;
    const safeLimit = Math.min(100, limitNumber);

    let query = { isVerified: true };
    if (category && category !== 'All' && category !== 'all') {
      query.category = category;
    }

    if (search && search.trim()) {
      const s = escapeRegex(search.trim());
      const serviceMatches = await Service.find({
        isActive: true,
        $or: [
          { title: { $regex: s, $options: 'i' } },
          { description: { $regex: s, $options: 'i' } },
          { tags: { $regex: s, $options: 'i' } },
        ],
      }).distinct('providerId');
      query.$or = [
        { businessName: { $regex: s, $options: 'i' } },
        { category: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { tags: { $regex: s, $options: 'i' } },
      ];
      if (serviceMatches.length) query.$or.push({ _id: { $in: serviceMatches } });
    }

    if (rating && rating !== 'any') {
      query.averageRating = { $gte: Number(rating) };
    }

    const priceServiceQuery = { isActive: true };
    if (minPrice !== undefined && Number.isFinite(Number(minPrice))) {
      priceServiceQuery['priceRange.max'] = { $gte: Number(minPrice) };
    }
    if (maxPrice !== undefined && Number.isFinite(Number(maxPrice))) {
      priceServiceQuery['priceRange.min'] = {
        ...(priceServiceQuery['priceRange.min'] || {}),
        $lte: Number(maxPrice),
      };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceProviderIds = await Service.find(priceServiceQuery).distinct('providerId');
      query._id = { $in: priceProviderIds };
    }

    let sortOption = {};
    if (sort === 'rating') sortOption = { averageRating: -1 };
    else if (sort === 'completed') sortOption = { totalServicesCompleted: -1, averageRating: -1 };
    else sortOption = { averageRating: -1 };

    const [providers, total] = await Promise.all([
      Provider.find(query)
      .populate('userId', 'name avatar isOnline lastActiveAt')
      .sort(sortOption)
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
      Provider.countDocuments(query),
    ]);

    const priceStats = await Service.aggregate([
      { $match: { isActive: true, providerId: { $in: providers.map((provider) => provider._id) } } },
      { $group: { _id: '$providerId', priceFrom: { $min: '$priceRange.min' } } },
    ]);
    const pricesByProvider = new Map(priceStats.map((item) => [item._id.toString(), item.priceFrom]));
    const providersWithPrices = providers.map((provider) => {
      const publicProvider = provider.toObject();
      delete publicProvider.trustScore;
      delete publicProvider.totalEarnings;
      return {
        ...publicProvider,
        priceFrom: pricesByProvider.get(provider._id.toString()) ?? null,
      };
    });
    if (sort === 'price_asc') {
      providersWithPrices.sort((a, b) => (a.priceFrom ?? Infinity) - (b.priceFrom ?? Infinity));
    }

    res.status(200).json({
      success: true,
      count: providers.length,
      total,
      page: safePage,
      pages: Math.ceil(total / safeLimit),
      providers: providersWithPrices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single provider profile
// @route   GET /api/providers/:id
// @access  Public
exports.getProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ _id: req.params.id, isVerified: true })
      .populate('userId', 'name avatar isOnline lastActiveAt');
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    const [reviews, services] = await Promise.all([
      Review.find({ providerId: provider._id })
      .populate('customerId', 'name avatar')
      .populate({ path: 'bookingId', select: 'serviceType serviceId', populate: { path: 'serviceId', select: 'title' } })
      .sort({ createdAt: -1 })
      .limit(10),
      Service.find({ providerId: provider._id, isActive: true }).sort({ createdAt: -1 }),
    ]);

    const publicProvider = provider.toObject();
    delete publicProvider.trustScore;
    delete publicProvider.totalEarnings;
    res.status(200).json({ success: true, provider: publicProvider, reviews, services });
  } catch (error) {
    next(error);
  }
};

// @desc    Update provider profile (own)
// @route   PUT /api/providers/me
// @access  Private (Provider)
exports.updateProviderProfile = async (req, res, next) => {
  try {
    const stringLimits = {
      businessName: 100,
      description: 3000,
      phone: 30,
      email: 254,
      businessHours: 120,
      experience: 100,
    };
    for (const [field, maxLength] of Object.entries(stringLimits)) {
      const value = req.body[field];
      if (value !== undefined && (typeof value !== 'string' || value.length > maxLength)) {
        return res.status(400).json({ success: false, message: `${field} must be a string of ${maxLength} characters or fewer` });
      }
    }
    if (req.body.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email.trim())) {
      return res.status(400).json({ success: false, message: 'Enter a valid business email address' });
    }
    if (req.body.location !== undefined && (!req.body.location || typeof req.body.location !== 'object' || Array.isArray(req.body.location) ||
      Object.keys(req.body.location).some((key) => !['address', 'city', 'state'].includes(key)) ||
      Object.entries(req.body.location).some(([key, value]) => typeof value !== 'string' || value.length > (key === 'address' ? 200 : 80)))) {
      return res.status(400).json({ success: false, message: 'Location must contain valid address, city, and state strings' });
    }
    if (req.body.tags !== undefined && (!Array.isArray(req.body.tags) || req.body.tags.length > 20 ||
      req.body.tags.some((tag) => typeof tag !== 'string' || !tag.trim() || tag.length > 40))) {
      return res.status(400).json({ success: false, message: 'Tags must be up to 20 non-empty strings of 40 characters or fewer' });
    }

    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider profile not found' });
    ['businessName', 'category', 'description', 'phone', 'email', 'businessHours', 'experience'].forEach((field) => {
      if (req.body[field] !== undefined) provider[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field];
    });
    if (req.body.location !== undefined) {
      for (const field of ['address', 'city', 'state']) {
        if (req.body.location[field] !== undefined) provider.location[field] = req.body.location[field].trim();
      }
    }
    if (req.body.tags !== undefined) provider.tags = req.body.tags.map((tag) => tag.trim());
    await provider.save();
    res.status(200).json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};

// @desc    Get provider dashboard stats
// @route   GET /api/providers/dashboard
// @access  Private (Provider)
exports.getProviderDashboard = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const [activeBookings, completedBookings, earningsHistory, earningsTotal] = await Promise.all([
      Booking.countDocuments({ providerId: provider._id, status: { $in: ['pending', 'accepted', 'in_progress'] } }),
      Booking.countDocuments({ providerId: provider._id, status: 'completed' }),
      Booking.aggregate([
        {
          $match: {
            providerId: provider._id,
            status: 'completed',
            paymentStatus: 'paid',
            paymentAmount: { $gt: 0 },
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, earnings: { $sum: '$paymentAmount' } } },
        { $sort: { _id: 1 } },
      ]),
      Booking.aggregate([
        { $match: { providerId: provider._id, status: 'completed', paymentStatus: 'paid', paymentAmount: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$paymentAmount' } } },
      ]),
    ]);

    const recentBookings = await Booking.find({ providerId: provider._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customerId', 'name avatar')
      .populate('serviceId', 'title');

    res.status(200).json({
      success: true,
      stats: {
        servicesCompleted: completedBookings,
        activeBookings,
        averageRating: provider.averageRating,
        totalEarnings: earningsTotal[0]?.total || 0,
      },
      recentBookings,
      provider,
      earningsHistory: earningsHistory.map((item) => ({ date: item._id, earnings: item.earnings })),
    });
  } catch (error) {
    next(error);
  }
};
