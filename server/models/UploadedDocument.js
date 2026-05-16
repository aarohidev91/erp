const mongoose = require('mongoose');

const uploadedDocumentSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String },
  fileSize: { type: Number },
  category: { type: String, trim: true },
  description: { type: String, trim: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('UploadedDocument', uploadedDocumentSchema);
