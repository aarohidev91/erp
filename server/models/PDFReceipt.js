const mongoose = require('mongoose');

const pdfReceiptSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
  receiptNumber: { type: String, unique: true, required: true },
  receiptType: {
    type: String,
    enum: [
      'visitor_entry', 'admission_enquiry', 'course_information',
      'counselling', 'department_discussion', 'practical_examiner_visit',
      'workshop_guest_visit', 'vendor_visit', 'fee_quotation',
      'fee_receipt', 'document_pending', 'admission_confirmation',
      'case_summary', 'report',
    ],
    required: true,
  },
  filePath: { type: String, required: true },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('PDFReceipt', pdfReceiptSchema);
