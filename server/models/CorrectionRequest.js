const mongoose = require('mongoose');

const correctionRequestSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
  fieldToCorrect: { type: String, required: true },
  oldValue: { type: String, required: true },
  requestedNewValue: { type: String, required: true },
  reason: { type: String, required: true, trim: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  reviewRemarks: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('CorrectionRequest', correctionRequestSchema);
