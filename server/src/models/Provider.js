const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Home Services', 'Tech Services', 'Vehicle Services', 'Student Services', 'Creative Services', 'Other'],
    },
    description: {
      type: String,
      default: '',
    },
    location: {
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    businessHours: {
      type: String,
      default: 'Mon - Sat 9:00 AM - 8:00 PM',
    },
    experience: { type: String, default: '' },
    happyCustomers: { type: Number, default: 0 },
    trustScore: { type: Number, default: 0, min: 0, max: 100 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalServicesCompleted: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    verificationDetails: {
      identityVerified: { type: Boolean, default: false },
      contactVerified: { type: Boolean, default: false },
      servicesVerified: { type: Boolean, default: false },
      positiveReviewHistory: { type: Boolean, default: false },
    },
    gallery: [{ type: String }],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Provider', providerSchema);
