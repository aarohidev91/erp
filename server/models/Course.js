const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true, uppercase: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  duration: { type: String, trim: true },
  totalSeats: { type: Number },
  availableSeats: { type: Number },
  fees: { type: Number },
  eligibility: { type: String, trim: true },
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
