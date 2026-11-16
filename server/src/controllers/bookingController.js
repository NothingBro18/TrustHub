const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const Service = require('../models/Service');
const User = require('../models/User');
const mongoose = require('mongoose');
const createNotification = require('../utils/createNotification');
const {
  isAllowedBookingUpdate,
  validateAppointment,
  isValidCollectedAmount,
} = require('../utils/bookingPolicy');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const getPagination = ({ page = 1, limit = 20 }) => {
  const isPositiveInteger = (value) => /^\d+$/.test(String(value)) && Number(value) > 0;
  if (!isPositiveInteger(page) || !isPositiveInteger(limit) || Number(page) > 100000) return null;
  const safePage = Number(page);
  const safeLimit = Math.min(100, Number(limit));
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
};

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private (Customer)
exports.createBooking = async (req, res, next) => {
  try {
    const {
      providerId, serviceId, issueDescription, scheduledDate, scheduledTime,
      serviceMode = 'doorstep', serviceAddress = '',
    } = req.body;

    if (![providerId, serviceId].every((id) => mongoose.isValidObjectId(id)) || !scheduledDate || !scheduledTime) {
      return res.status(400).json({ success: false, message: 'A valid provider, service, date, and time are required' });
    }
    if (!['doorstep', 'shop_visit'].includes(serviceMode)) {
      return res.status(400).json({ success: false, message: 'Invalid service mode' });
    }
    if (typeof serviceAddress !== 'string' || (serviceMode === 'doorstep' && !serviceAddress.trim())) {
      return res.status(400).json({ success: false, message: 'Service address is required for doorstep service' });
    }
    const appointmentError = validateAppointment(scheduledDate, scheduledTime);
    if (appointmentError) return res.status(400).json({ success: false, message: appointmentError });
    if (issueDescription !== undefined && (typeof issueDescription !== 'string' || issueDescription.length > 2000)) {
      return res.status(400).json({ success: false, message: 'The service description must be 2000 characters or fewer' });
    }

    const [provider, service] = await Promise.all([
      Provider.findOne({ _id: providerId, isVerified: true }),
      Service.findOne({ _id: serviceId, isActive: true }),
    ]);
    if (!provider || !service || service.providerId.toString() !== provider._id.toString()) {
      return res.status(400).json({ success: false, message: 'Select an active service from a verified provider' });
    }

    const images = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];

    const booking = await Booking.create({
      customerId: req.user.id,
      providerId,
      serviceId,
      serviceType: service.title,
      issueDescription,
      scheduledDate,
      scheduledTime,
      serviceMode,
      serviceAddress: serviceAddress.trim(),
      estimatedPrice: service.priceRange,
      images,
    });

    await createNotification(
      provider.userId,
      `New booking request for ${service.title}`,
      'booking',
      '/provider/bookings'
    );
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
    const { status, page = 1, limit = 20, search } = req.query;
    const query = { customerId: req.user.id };
    if (search !== undefined && typeof search !== 'string') {
      return res.status(400).json({ success: false, message: 'Search must be a string' });
    }
    if (status && status !== 'all') {
      if (!['pending', 'accepted', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid booking status filter' });
      }
      query.status = status;
    }
    if (typeof search === 'string' && search.trim()) {
      const matcher = new RegExp(escapeRegex(search.trim()), 'i');
      const matchingProviders = await Provider.find({ businessName: matcher }).distinct('_id');
      query.$or = [
        { serviceType: matcher },
        { issueDescription: matcher },
        { providerId: { $in: matchingProviders } },
      ];
    }
    const pagination = getPagination({ page, limit });
    if (!pagination) return res.status(400).json({ success: false, message: 'Invalid pagination values' });

    const [bookings, total] = await Promise.all([
      Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate({
        path: 'providerId',
        select: 'businessName location phone averageRating userId category businessHours',
        populate: {
          path: 'userId',
          select: 'name email phone avatar isOnline lastActiveAt',
        },
      })
      .populate('serviceId', 'title category priceRange'),
      Booking.countDocuments(query),
    ]);
    res.status(200).json({ success: true, bookings, total, page: pagination.page, pages: Math.ceil(total / pagination.limit) });
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

    const { status, page = 1, limit = 20, search } = req.query;
    const query = { providerId: provider._id };
    if (search !== undefined && typeof search !== 'string') {
      return res.status(400).json({ success: false, message: 'Search must be a string' });
    }
    if (status && status !== 'all') {
      if (!['pending', 'accepted', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid booking status filter' });
      }
      query.status = status;
    }
    if (typeof search === 'string' && search.trim()) {
      const matcher = new RegExp(escapeRegex(search.trim()), 'i');
      const matchingCustomers = await User.find({ name: matcher }).distinct('_id');
      query.$or = [
        { serviceType: matcher },
        { issueDescription: matcher },
        { customerId: { $in: matchingCustomers } },
      ];
    }
    const pagination = getPagination({ page, limit });
    if (!pagination) return res.status(400).json({ success: false, message: 'Invalid pagination values' });

    const [bookings, total] = await Promise.all([
      Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate('customerId', 'name email phone avatar isOnline lastActiveAt location')
      .populate('serviceId', 'title category priceRange'),
      Booking.countDocuments(query),
    ]);
    res.status(200).json({ success: true, bookings, total, page: pagination.page, pages: Math.ceil(total / pagination.limit), provider });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Customer [cancel only], Provider, Admin)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status, paymentAmount, paymentReceived, notes } = req.body;
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isCustomer = req.user.role === 'customer' && booking.customerId.toString() === req.user.id.toString();
    const isProvider = req.user.role === 'provider';
    let ownsProvider = false;
    if (isProvider) {
      const provider = await Provider.findOne({ userId: req.user.id });
      ownsProvider = Boolean(provider && provider._id.toString() === booking.providerId.toString());
    }

    const allowed = isAllowedBookingUpdate({
      role: req.user.role,
      currentStatus: booking.status,
      nextStatus: status,
      ownsBooking: isCustomer,
      ownsProvider,
    });
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Not authorized for this booking status change' });
    }
    if ((paymentAmount !== undefined || paymentReceived !== undefined) && (!isProvider || !ownsProvider)) {
      return res.status(403).json({ success: false, message: 'Only the assigned provider can record offline payment' });
    }
    if ((paymentAmount !== undefined || paymentReceived !== undefined) && status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Payment can only be recorded when completing a booking' });
    }

    const previousStatus = booking.status;
    booking.status = status;
    if (notes !== undefined) {
      if (typeof notes !== 'string' || notes.length > 2000) {
        return res.status(400).json({ success: false, message: 'Notes must be 2000 characters or fewer' });
      }
      booking.notes = notes;
    }

    let providerStatsToUpdate;
    if (status === 'completed' && previousStatus !== 'completed') {
      if (paymentAmount !== undefined) {
        if (typeof paymentAmount !== 'number' || !Number.isFinite(paymentAmount) || paymentAmount < 0) {
          return res.status(400).json({ success: false, message: 'Payment amount must be a non-negative number' });
        }
        booking.paymentAmount = paymentAmount;
      }
      if (paymentReceived !== undefined && typeof paymentReceived !== 'boolean') {
        return res.status(400).json({ success: false, message: 'Payment received must be a boolean value' });
      }
      booking.paymentStatus = paymentReceived === true ? 'paid' : 'unpaid';

      providerStatsToUpdate = { totalServicesCompleted: 1 };
      if (paymentReceived === true) {
        if (!isValidCollectedAmount(booking.paymentAmount)) {
          return res.status(400).json({ success: false, message: 'Enter a positive amount collected before marking payment as received' });
        }
      }
    }

    await booking.save();
    if (providerStatsToUpdate) {
      await Provider.findByIdAndUpdate(booking.providerId, { $inc: providerStatsToUpdate });
    }
    const service = await Service.findById(booking.serviceId).select('title');
    await createNotification(
      booking.customerId,
      `Your booking${service?.title ? ` for ${service.title}` : ''} was ${status.replace('_', ' ')}`,
      'booking',
      '/my-bookings'
    );
    if (status === 'completed' && paymentReceived === true) {
      await createNotification(
        booking.customerId,
        'The provider reported receiving an offline payment for your completed booking.',
        'payment',
        '/my-bookings'
      );
    }

    const updatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name email phone avatar isOnline lastActiveAt location')
      .populate({
        path: 'providerId',
        select: 'businessName location phone averageRating userId category',
        populate: { path: 'userId', select: 'name email phone avatar isOnline lastActiveAt' },
      })
      .populate('serviceId', 'title category priceRange');

    res.status(200).json({ success: true, booking: updatedBooking });
  } catch (error) {
    next(error);
  }
};

exports.markPaymentReceived = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }
    const { paymentAmount } = req.body;
    if (!isValidCollectedAmount(paymentAmount)) {
      return res.status(400).json({ success: false, message: 'Enter a positive amount actually collected' });
    }

    const provider = await Provider.findOne({ userId: req.user.id }).select('_id');
    if (!provider) return res.status(404).json({ success: false, message: 'Provider profile not found' });
    const booking = await Booking.findOne({
      _id: req.params.id,
      providerId: provider._id,
      status: 'completed',
      paymentStatus: 'unpaid',
    });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Unpaid completed booking not found' });
    }

    booking.paymentAmount = paymentAmount;
    booking.paymentStatus = 'paid';
    await booking.save();
    await createNotification(
      booking.customerId,
      'The provider reported receiving an offline payment for your completed booking.',
      'payment',
      '/my-bookings'
    );
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
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const provider = await Provider.findOne({ userId: req.user.id }).select('_id');
    const isCustomer = booking.customerId.toString() === req.user.id.toString();
    const isProvider = provider && provider._id.toString() === booking.providerId.toString();
    if (req.user.role !== 'admin' && !isCustomer && !isProvider) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    const populatedBooking = await Booking.findById(req.params.id)
      .populate('customerId', 'name email phone avatar isOnline lastActiveAt location')
      .populate({
        path: 'providerId',
        select: 'businessName location phone averageRating userId category businessHours',
        populate: { path: 'userId', select: 'name email phone avatar isOnline lastActiveAt' },
      })
      .populate('serviceId', 'title category priceRange');

    res.status(200).json({ success: true, booking: populatedBooking });
  } catch (error) {
    next(error);
  }
};
