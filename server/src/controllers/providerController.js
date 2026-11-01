const Provider = require('../models/Provider');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// @desc    Get all providers (with search & filter)
// @route   GET /api/providers
// @access  Public
exports.getProviders = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, rating, available, sort = 'trustScore', page = 1, limit = 10 } = req.query;

    let query = { isVerified: true };
    if (category) query.category = category;

    const skip = (Number(page) - 1) * Number(limit);

    let sortOption = {};
    if (sort === 'rating') sortOption = { averageRating: -1 };
    else if (sort === 'trustScore') sortOption = { trustScore: -1 };

    const providers = await Provider.find(query)
      .populate('userId', 'name avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Provider.countDocuments(query);

    res.status(200).json({
      success: true,
      count: providers.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      providers,
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
    const provider = await Provider.findById(req.params.id).populate('userId', 'name avatar email');
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    const reviews = await Review.find({ providerId: provider._id })
      .populate('customerId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({ success: true, provider, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Update provider profile (own)
// @route   PUT /api/providers/me
// @access  Private (Provider)
exports.updateProviderProfile = async (req, res, next) => {
  try {
    const allowedFields = ['businessName', 'description', 'location', 'phone', 'email', 'businessHours', 'experience', 'tags'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const provider = await Provider.findOneAndUpdate(
      { userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );
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

    const [activeBookings, completedBookings] = await Promise.all([
      Booking.countDocuments({ providerId: provider._id, status: { $in: ['pending', 'accepted', 'in_progress'] } }),
      Booking.countDocuments({ providerId: provider._id, status: 'completed' }),
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
        trustScore: provider.trustScore,
        totalEarnings: provider.totalEarnings,
      },
      recentBookings,
      provider,
    });
  } catch (error) {
    next(error);
  }
};
