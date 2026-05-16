const mongoose = require('mongoose');

const DOCUMENT_TYPES = [
  '10th_marksheet', '12th_marksheet', 'graduation_marksheet',
  'transfer_certificate', 'migration_certificate', 'character_certificate',
  'aadhaar_card', 'caste_certificate', 'income_certificate',
  'domicile_certificate', 'entrance_exam_score', 'passport_photo',
  'signature', 'medical_certificate', 'anti_ragging_form',
  'gap_certificate', 'other',
];

const documentChecklistSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
  documentType: { type: String, enum: DOCUMENT_TYPES, required: true },
  customLabel: { type: String, trim: true },
  isRequired: { type: Boolean, default: true },
  isReceived: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  filePath: { type: String },
  remarks: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('DocumentChecklist', documentChecklistSchema);
module.exports.DOCUMENT_TYPES = DOCUMENT_TYPES;
