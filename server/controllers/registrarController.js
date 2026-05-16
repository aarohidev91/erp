const Case = require('../models/Case');
const DocumentChecklist = require('../models/DocumentChecklist');
const UploadedDocument = require('../models/UploadedDocument');
const { addTimelineEvent } = require('../utils/timelineHelper');
const { createAuditLog } = require('../middleware/auditLogger');
const { generateAdmissionConfirmationPDF } = require('../services/pdfService');

exports.initializeDocumentChecklist = async (req, res, next) => {
  try {
    const caseData = await Case.findById(req.params.caseId);
    if (!caseData) return res.status(404).json({ message: 'Case not found' });
    const { documents } = req.body;
    const created = [];
    for (const doc of documents) {
      const checklist = await DocumentChecklist.create({ ...doc, case: caseData._id, createdBy: req.user._id });
      created.push(checklist);
    }
    res.status(201).json({ checklist: created });
  } catch (error) {
    next(error);
  }
};

exports.updateDocumentStatus = async (req, res, next) => {
  try {
    const { isReceived, isVerified, remarks } = req.body;
    const doc = await DocumentChecklist.findById(req.params.docId);
    if (!doc) return res.status(404).json({ message: 'Document not found in checklist' });
    if (isReceived !== undefined) doc.isReceived = isReceived;
    if (isVerified !== undefined) {
      doc.isVerified = isVerified;
      if (isVerified) { doc.verifiedBy = req.user._id; doc.verifiedAt = new Date(); }
    }
    if (remarks) doc.remarks = remarks;
    await doc.save();
    await addTimelineEvent({ caseId: doc.case, eventType: 'document_verified', description: `Document ${doc.documentType} ${isVerified ? 'verified' : 'updated'}`, performedBy: req.user._id });
    res.json({ document: doc });
  } catch (error) {
    next(error);
  }
};

exports.uploadDocument = async (req, res, next) => {
  try {
    const caseData = await Case.findById(req.params.caseId);
    if (!caseData) return res.status(404).json({ message: 'Case not found' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const uploaded = await UploadedDocument.create({
      case: caseData._id, fileName: req.file.filename, originalName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`, fileType: req.file.mimetype,
      fileSize: req.file.size, category: req.body.category, description: req.body.description,
      uploadedBy: req.user._id,
    });
    await addTimelineEvent({ caseId: caseData._id, eventType: 'document_uploaded', description: `Document uploaded: ${req.file.originalname}`, performedBy: req.user._id });
    res.status(201).json({ document: uploaded });
  } catch (error) {
    next(error);
  }
};

exports.finalizeAdmission = async (req, res, next) => {
  try {
    const { applicationNumber, enrollmentNumber, rollNumber, batch, session, section, status } = req.body;
    const caseData = await Case.findById(req.params.caseId);
    if (!caseData) return res.status(404).json({ message: 'Case not found' });
    if (applicationNumber) caseData.applicationNumber = applicationNumber;
    if (enrollmentNumber) caseData.enrollmentNumber = enrollmentNumber;
    if (rollNumber) caseData.rollNumber = rollNumber;
    if (batch) caseData.batch = batch;
    if (session) caseData.session = session;
    if (section) caseData.section = section;
    caseData.currentStatus = status || 'admitted';
    await caseData.save();

    await addTimelineEvent({ caseId: caseData._id, eventType: 'admission_finalized', description: `Admission finalized. Status: ${caseData.currentStatus}. Enrollment: ${enrollmentNumber || 'N/A'}`, performedBy: req.user._id, metadata: { enrollmentNumber, rollNumber, batch, session } });
    await createAuditLog({ action: 'admission_finalized', entity: 'Case', entityId: caseData._id, caseId: caseData._id, newData: { status: caseData.currentStatus, enrollmentNumber, rollNumber }, performedBy: req.user._id, req });

    let receipt = null;
    if (caseData.currentStatus === 'admitted') {
      receipt = await generateAdmissionConfirmationPDF(caseData, req.user._id);
      await addTimelineEvent({ caseId: caseData._id, eventType: 'pdf_generated', description: 'Admission confirmation PDF generated', performedBy: req.user._id });
    }

    res.json({ case: caseData, receipt });
  } catch (error) {
    next(error);
  }
};

exports.getDocumentChecklist = async (req, res, next) => {
  try {
    const checklist = await DocumentChecklist.find({ case: req.params.caseId })
      .populate('verifiedBy', 'firstName lastName')
      .sort({ documentType: 1 });
    res.json({ checklist });
  } catch (error) {
    next(error);
  }
};
