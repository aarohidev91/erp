const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'case_assigned', 'case_forwarded', 'case_returned', 'follow_up_due',
      'follow_up_overdue', 'correction_submitted', 'correction_approved',
      'correction_rejected', 'payment_pending', 'document_pending',
      'case_stuck', 'general',
    ],
    default: 'general',
  },
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
