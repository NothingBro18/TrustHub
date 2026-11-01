const Booking = require('../models/Booking');
const Provider = require('../models/Provider');

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private (Customer)
exports.createBooking = async (req, res, next) => {
  try {
    const { providerId, serviceId, serviceType, issueDescription, scheduledDate, scheduledTime, estimatedPrice } = req.body;

    const images = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];

    const booking = await Booking.create({
      customerId: req.user.id,
      providerId,
      serviceId,
      serviceType,
      issueDescription,
      scheduledDate,
      scheduledTime,
      estimatedPrice,
      images,
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's bookings
// @route   GET /api/bookings/my
// @access  Private (Customer)
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { customerId: req.user.id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('providerId', 'businessName location averageRating')
      .populate('serviceId', 'title category');

    const total = await Booking.countDocuments(query);
    res.status(200).json({ success: true, bookings, total });
  } catch (error) {
    next(error);
  }
};

// @desc    Get provider's bookings
// @route   GET /api/bookings/provider
// @access  Private (Provider)
exports.getProviderBookings = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider profile not found' });

    const { status, page = 1, limit = 10 } = req.query;
    const query = { providerId: provider._id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('customerId', 'name avatar phone')
      .populate('serviceId', 'title category');

    const total = await Booking.countDocuments(query);
    res.status(200).json({ success: true, bookings, total });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Provider / Admin)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.status = status;
    if (status === 'completed') {
      booking.paymentStatus = 'paid';
      // Update provider stats
      await Provider.findByIdAndUpdate(booking.providerId, {
        $inc: { totalServicesCompleted: 1, totalEarnings: booking.paymentAmount || 0 },
      });
    }
    await booking.save();

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customerId', 'name avatar phone')
      .populate('providerId', 'businessName location phone trustScore averageRating')
      .populate('serviceId', 'title category priceRange');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};
