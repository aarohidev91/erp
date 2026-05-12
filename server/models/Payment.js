const mongoose = require('mongoose');

const PAYMENT_MODES = [
  'cash', 'upi', 'card', 'bank_transfer', 'cheque', 'dd', 'online_gateway', 'other',
];

const PAYMENT_STATUSES = ['unpaid', 'partially_paid', 'paid', 'refunded', 'cancelled'];

const paymentSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
  receiptNumber: { type: String, unique: true, required: true },
  amount: { type: Number, required: true },
  paymentMode: { type: String, enum: PAYMENT_MODES, required: true },
  transactionId: { type: String, trim: true },
  paymentProof: { type: String },
  status: { type: String, enum: PAYMENT_STATUSES, default: 'paid' },
  description: { type: String, trim: true },
  isLocked: { type: Boolean, default: true },
  isCancelled: { type: Boolean, default: false },
  cancelReason: { type: String, trim: true },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelledAt: { type: Date },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
module.exports.PAYMENT_MODES = PAYMENT_MODES;
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
