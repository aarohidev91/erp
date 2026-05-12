const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, enum: ['login', 'logout', 'failed_login', 'token_refresh'], required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  success: { type: Boolean, default: true },
  reason: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('LoginLog', loginLogSchema);
