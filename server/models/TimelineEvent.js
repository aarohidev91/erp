const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
  eventType: {
    type: String,
    enum: [
      'created', 'forwarded', 'returned', 'status_changed', 'note_added',
      'remark_edited', 'assigned', 'reassigned', 'correction_requested',
      'correction_approved', 'correction_rejected', 'payment_recorded',
      'payment_cancelled', 'document_uploaded', 'document_verified',
      'pdf_generated', 'visitor_exit', 'case_closed', 'case_reopened',
      'case_soft_deleted', 'lead_temperature_changed', 'counselling_status_changed',
      'department_recommendation', 'admission_finalized', 'converted_to_admission',
      'fee_quotation_created', 'installment_created', 'discount_approved',
    ],
    required: true,
  },
  description: { type: String, required: true },
  fromDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  toDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

timelineEventSchema.index({ case: 1, createdAt: 1 });

module.exports = mongoose.model('TimelineEvent', timelineEventSchema);
