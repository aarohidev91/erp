const CorrectionRequest = require('../models/CorrectionRequest');
const Case = require('../models/Case');
const { addTimelineEvent } = require('../utils/timelineHelper');
const { createNotification } = require('../utils/notificationHelper');
const { createAuditLog } = require('../middleware/auditLogger');

exports.createCorrectionRequest = async (req, res, next) => {
  try {
    const { fieldToCorrect, oldValue, requestedNewValue, reason } = req.body;
    const caseData = await Case.findById(req.params.caseId);
    if (!caseData) return res.status(404).json({ message: 'Case not found' });

    const correction = await CorrectionRequest.create({
      case: caseData._id, fieldToCorrect, oldValue, requestedNewValue, reason,
      requestedBy: req.user._id,
    });

    await addTimelineEvent({ caseId: caseData._id, eventType: 'correction_requested', description: `Correction requested for field: ${fieldToCorrect}`, performedBy: req.user._id, metadata: { fieldToCorrect, oldValue, requestedNewValue } });
    await createAuditLog({ action: 'correction_requested', entity: 'CorrectionRequest', entityId: correction._id, caseId: caseData._id, newData: { fieldToCorrect, oldValue, requestedNewValue, reason }, performedBy: req.user._id, req });

    const populated = await CorrectionRequest.findById(correction._id).populate('requestedBy', 'firstName lastName');
    res.status(201).json({ correctionRequest: populated });
  } catch (error) {
    next(error);
  }
};

exports.reviewCorrectionRequest = async (req, res, next) => {
  try {
    const { status, reviewRemarks } = req.body;
    const correction = await CorrectionRequest.findById(req.params.id);
    if (!correction) return res.status(404).json({ message: 'Correction request not found' });
    if (correction.status !== 'pending') return res.status(400).json({ message: 'Correction already reviewed' });

    correction.status = status;
    correction.reviewedBy = req.user._id;
    correction.reviewedAt = new Date();
    correction.reviewRemarks = reviewRemarks;
    await correction.save();

    if (status === 'approved') {
      const caseData = await Case.findById(correction.case);
      if (caseData) {
        const prevValue = caseData[correction.fieldToCorrect];
        caseData[correction.fieldToCorrect] = correction.requestedNewValue;
        await caseData.save();
        await addTimelineEvent({ caseId: caseData._id, eventType: 'correction_approved', description: `Correction approved for ${correction.fieldToCorrect}: "${prevValue}" → "${correction.requestedNewValue}"`, performedBy: req.user._id, metadata: { field: correction.fieldToCorrect, oldValue: prevValue, newValue: correction.requestedNewValue } });
      }
    } else {
      await addTimelineEvent({ caseId: correction.case, eventType: 'correction_rejected', description: `Correction rejected for ${correction.fieldToCorrect}. Reason: ${reviewRemarks || 'No reason'}`, performedBy: req.user._id });
    }

    await createAuditLog({ action: `correction_${status}`, entity: 'CorrectionRequest', entityId: correction._id, caseId: correction.case, newData: { status, reviewRemarks }, performedBy: req.user._id, req });
    await createNotification({ userId: correction.requestedBy, title: `Correction ${status}`, message: `Your correction request for ${correction.fieldToCorrect} has been ${status}.`, type: status === 'approved' ? 'correction_approved' : 'correction_rejected', caseId: correction.case });

    const populated = await CorrectionRequest.findById(correction._id).populate('requestedBy', 'firstName lastName').populate('reviewedBy', 'firstName lastName');
    res.json({ correctionRequest: populated });
  } catch (error) {
    next(error);
  }
};

exports.getCorrectionRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (req.query.caseId) filter.case = req.query.caseId;
    const requests = await CorrectionRequest.find(filter)
      .populate('case', 'caseId visitorName')
      .populate('requestedBy', 'firstName lastName')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await CorrectionRequest.countDocuments(filter);
    res.json({ correctionRequests: requests, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};
