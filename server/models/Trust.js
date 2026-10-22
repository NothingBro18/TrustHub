import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const trustSchema = new mongoose.Schema({
  trustName: { type: String, required: true },
  trusteeName: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  trustType: { type: String, required: true },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending',
  },
  statusHistory: { type: [statusHistorySchema], default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

const Trust = mongoose.models.Trust || mongoose.model('Trust', trustSchema);

export default Trust;