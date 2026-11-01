const mongoose = require('mongoose');

const flaggedActivitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['unusual_review', 'suspicious_account', 'multiple_reviews', 'failed_login', 'other'],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    description: { type: String, required: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    resolved: { type: Boolean, default: false },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FlaggedActivity', flaggedActivitySchema);
