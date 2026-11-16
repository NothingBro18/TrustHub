const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    serviceType: { type: String, required: true },
    issueDescription: { type: String, default: '', maxlength: 2000 },
    images: [{ type: String }],
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String, required: true },
    serviceMode: {
      type: String,
      enum: ['doorstep', 'shop_visit'],
      default: 'doorstep',
    },
    serviceAddress: { type: String, default: '' },
    estimatedPrice: {
      min: { type: Number },
      max: { type: Number },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentAmount: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: '', maxlength: 2000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
