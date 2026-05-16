const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  session: { type: String, trim: true },
  registrationFee: { type: Number, default: 0 },
  admissionFee: { type: Number, default: 0 },
  tuitionFee: { type: Number, default: 0 },
  labFee: { type: Number, default: 0 },
  libraryFee: { type: Number, default: 0 },
  examFee: { type: Number, default: 0 },
  hostelFee: { type: Number, default: 0 },
  transportFee: { type: Number, default: 0 },
  uniformBookFee: { type: Number, default: 0 },
  otherCharges: { type: Number, default: 0 },
  totalFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  discountReason: { type: String, trim: true },
  discountApproved: { type: Boolean, default: false },
  discountApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scholarship: { type: Number, default: 0 },
  scholarshipDetails: { type: String, trim: true },
  netPayable: { type: Number, default: 0 },
  paymentPlan: { type: String, trim: true },
  remarks: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

feeStructureSchema.pre('save', function (next) {
  this.totalFee = this.registrationFee + this.admissionFee + this.tuitionFee +
    this.labFee + this.libraryFee + this.examFee + this.hostelFee +
    this.transportFee + this.uniformBookFee + this.otherCharges;
  this.netPayable = this.totalFee - this.discount - this.scholarship;
  next();
});

module.exports = mongoose.model('FeeStructure', feeStructureSchema);
