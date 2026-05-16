const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', index: true },
  previousData: { type: mongoose.Schema.Types.Mixed },
  newData: { type: mongoose.Schema.Types.Mixed },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ entity: 1, action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
