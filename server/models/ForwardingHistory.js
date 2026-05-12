const mongoose = require('mongoose');

const forwardingHistorySchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
  fromDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  toDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String, required: true, trim: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  expectedAction: { type: String, trim: true },
  notes: { type: String, trim: true },
  dueDate: { type: Date },
  forwardedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('ForwardingHistory', forwardingHistorySchema);
