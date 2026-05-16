const mongoose = require('mongoose');

const NOTE_TYPES = [
  'internal', 'visible', 'follow_up', 'correction', 'management',
  'department', 'accounts', 'registrar', 'counselling', 'reception',
];

const remarkVersionSchema = new mongoose.Schema({
  previousText: { type: String, required: true },
  newText: { type: String, required: true },
  editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  editedAt: { type: Date, default: Date.now },
  reason: { type: String, trim: true },
}, { _id: true });

const noteSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
  text: { type: String, required: true },
  noteType: { type: String, enum: NOTE_TYPES, default: 'visible' },
  followUpDate: { type: Date },
  followUpCompleted: { type: Boolean, default: false },
  versionHistory: [remarkVersionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
module.exports.NOTE_TYPES = NOTE_TYPES;
