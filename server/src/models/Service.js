const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      required: true,
      enum: ['Home Services', 'Tech Services', 'Vehicle Services', 'Student Services', 'Creative Services', 'Other'],
    },
    description: { type: String, default: '', maxlength: 2000 },
    priceRange: {
      min: { type: Number, required: true, min: 0 },
      max: { type: Number, required: true, min: 0 },
    },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.pre('validate', function (next) {
  if (this.priceRange && this.priceRange.min > this.priceRange.max) {
    this.invalidate('priceRange.max', 'Maximum price must be greater than or equal to minimum price');
  }
  next();
});

module.exports = mongoose.model('Service', serviceSchema);
