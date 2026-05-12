const Case = require('../models/Case');
const TimelineEvent = require('../models/TimelineEvent');
const ForwardingHistory = require('../models/ForwardingHistory');
const Note = require('../models/Note');
const CorrectionRequest = require('../models/CorrectionRequest');
const Payment = require('../models/Payment');
const FeeStructure = require('../models/FeeStructure');
const DocumentChecklist = require('../models/DocumentChecklist');
const UploadedDocument = require('../models/UploadedDocument');
const PDFReceipt = require('../models/PDFReceipt');
const CustomPurposeCategory = require('../models/CustomPurposeCategory');
const { addTimelineEvent } = require('../utils/timelineHelper');
const { createNotification } = require('../utils/notificationHelper');
const { createAuditLog } = require('../middleware/auditLogger');
const { generateVisitorEntryPDF, generateCaseSummaryPDF } = require('../services/pdfService');

const LOCKED_FIELDS = [
  'visitorName', 'visitorType', 'studentName', 'parentName', 'mobile',
  'alternateMobile', 'email', 'address', 'city', 'state', 'numberOfPeople',
  'purposeCategory', 'customPurposeTitle', 'customPurposeDescription',
  'source', 'entryTime', 'vehicleNumber', 'idProof',
];

exports.createCase = async (req, res, next) => {
  try {
    const caseData = { ...req.body, createdBy: req.user._id, currentStatus: 'new', lockedAfterSubmit: true };
    if (req.body.purposeCategory === 'custom' && req.body.customPurposeTitle) {
      await CustomPurposeCategory.create({ title: req.body.customPurposeTitle, description: req.body.customPurposeDescription, createdBy: req.user._id });
    }
    const newCase = await Case.create(caseData);
    await addTimelineEvent({ caseId: newCase._id, eventType: 'created', description: `Case created by ${req.user.firstName} ${req.user.lastName} - Purpose: ${newCase.purposeCategory.replace(/_/g, ' ')}`, performedBy: req.user._id });
    await createAuditLog({ action: 'case_created', entity: 'Case', entityId: newCase._id, caseId: newCase._id, newData: { caseId: newCase.caseId, visitorName: newCase.visitorName, purposeCategory: newCase.purposeCategory }, performedBy: req.user._id, req });
    const populated = await Case.findById(newCase._id).populate('currentDepartment', 'name code').populate('currentAssignedUser', 'firstName lastName').populate('createdBy', 'firstName lastName').populate('preferredCourse', 'name code');
    res.status(201).json({ case: populated });
  } catch (error) {
    next(error);
  }
};

exports.getCases = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, department, assignedUser, purposeCategory, priority, search, startDate, endDate, createdBy, visitorType, source, leadTemperature } = req.query;
    const filter = { isDeleted: false };
    if (status) filter.currentStatus = status;
    if (department) filter.currentDepartment = department;
    if (assignedUser) filter.currentAssignedUser = assignedUser;
    if (purposeCategory) filter.purposeCategory = purposeCategory;
    if (priority) filter.priority = priority;
    if (createdBy) filter.createdBy = createdBy;
    if (visitorType) filter.visitorType = visitorType;
    if (source) filter.source = source;
    if (leadTemperature) filter.leadTemperature = leadTemperature;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }
    if (search) {
      filter.$or = [
        { caseId: { $regex: search, $options: 'i' } },
        { visitorName: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
        { parentName: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const cases = await Case.find(filter)
      .populate('currentDepartment', 'name code')
      .populate('currentAssignedUser', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .populate('preferredCourse', 'name code')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Case.countDocuments(filter);
    res.json({ cases, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

exports.getCaseById = async (req, res, next) => {
  try {
    const caseData = await Case.findById(req.params.id)
      .populate('currentDepartment', 'name code')
      .populate('currentAssignedUser', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .populate('preferredCourse', 'name code')
      .populate('alternateCourse', 'name code');
    if (!caseData) return res.status(404).json({ message: 'Case not found' });

    const [timeline, forwardingHistory, notes, correctionRequests, payments, feeStructures, documents, checklist, receipts] = await Promise.all([
      TimelineEvent.find({ case: caseData._id }).populate('performedBy', 'firstName lastName').populate('fromDepartment', 'name').populate('toDepartment', 'name').sort({ createdAt: 1 }),
      ForwardingHistory.find({ case: caseData._id }).populate('fromDepartment', 'name').populate('toDepartment', 'name').populate('fromUser', 'firstName lastName').populate('toUser', 'firstName lastName').populate('forwardedBy', 'firstName lastName').sort({ createdAt: -1 }),
      Note.find({ case: caseData._id }).populate('createdBy', 'firstName lastName').populate('department', 'name').populate('versionHistory.editedBy', 'firstName lastName').sort({ createdAt: -1 }),
      CorrectionRequest.find({ case: caseData._id }).populate('requestedBy', 'firstName lastName').populate('reviewedBy', 'firstName lastName').sort({ createdAt: -1 }),
      Payment.find({ case: caseData._id }).populate('recordedBy', 'firstName lastName').sort({ createdAt: -1 }),
      FeeStructure.find({ case: caseData._id }).populate('course', 'name code').populate('createdBy', 'firstName lastName').sort({ createdAt: -1 }),
      UploadedDocument.find({ case: caseData._id }).populate('uploadedBy', 'firstName lastName').sort({ createdAt: -1 }),
      DocumentChecklist.find({ case: caseData._id }).populate('verifiedBy', 'firstName lastName').sort({ documentType: 1 }),
      PDFReceipt.find({ case: caseData._id }).populate('generatedBy', 'firstName lastName').sort({ createdAt: -1 }),
    ]);

    res.json({ case: caseData, timeline, forwardingHistory, notes, correctionRequests, payments, feeStructures, documents, checklist, receipts });
  } catch (error) {
    next(error);
  }
};

exports.updateCaseStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: 'Case not found' });
    const prevStatus = caseData.currentStatus;
    caseData.currentStatus = status;
    await caseData.save();
    await addTimelineEvent({ caseId: caseData._id, eventType: 'status_changed', description: `Status changed from ${prevStatus} to ${status}${reason ? ': ' + reason : ''}`, performedBy: req.user._id, metadata: { from: prevStatus, to: status } });
    await createAuditLog({ action: 'status_changed', entity: 'Case', entityId: caseData._id, caseId: caseData._id, previousData: { status: prevStatus }, newData: { status }, performedBy: req.user._id, req });
    res.json({ case: caseData });
  } catch (error) {
    next(error);
  }
};

const ALLOWED_UPDATE_FIELDS = [
  'leadTemperature', 'counsellingStatus', 'departmentRecommendation',
  'eligibilityDetails', 'preferredCourse', 'alternateCourse', 'budgetConcern',
  'scholarshipDiscussion', 'hostelRequired', 'transportRequired',
  'exitTime', 'priority',
  'examinerName', 'examinerInstitution', 'examinerSubject', 'examinerContact',
  'concernedFaculty',
  'guestSpeakerName', 'guestOrganization', 'eventTopic', 'eventSchedule',
  'eventVenue', 'eventRequirements', 'honorariumDiscussion', 'responsibleCoordinator',
  'vendorCompany', 'vendorContactPerson', 'vendorPurpose',
];

exports.updateCaseFields = async (req, res, next) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: 'Case not found' });
    const updates = {};
    for (const key of Object.keys(req.body)) {
      if (ALLOWED_UPDATE_FIELDS.includes(key)) {
        updates[key] = req.body[key];
      } else if (caseData.lockedAfterSubmit && LOCKED_FIELDS.includes(key)) {
        return res.status(403).json({ message: `Cannot edit locked field: ${key}. Use correction request.`, blockedFields: [key] });
      }
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }
    const prev = {};
    for (const key of Object.keys(updates)) {
      prev[key] = caseData[key];
      caseData[key] = updates[key];
    }
    await caseData.save();
    await addTimelineEvent({ caseId: caseData._id, eventType: 'status_changed', description: `Case fields updated: ${Object.keys(updates).join(', ')}`, performedBy: req.user._id });
    await createAuditLog({ action: 'case_fields_updated', entity: 'Case', entityId: caseData._id, caseId: caseData._id, previousData: prev, newData: updates, performedBy: req.user._id, req });
    res.json({ case: caseData });
  } catch (error) {
    next(error);
  }
};

exports.forwardCase = async (req, res, next) => {
  try {
    const { toDepartment, toUser, reason, priority, expectedAction, notes, dueDate, newStatus } = req.body;
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: 'Case not found' });
    const fromDept = caseData.currentDepartment;
    const fromUser = caseData.currentAssignedUser;

    let resolvedDept = toDepartment;
    if (!resolvedDept && toUser) {
      const User = require('../models/User');
      const targetUser = await User.findById(toUser);
      if (targetUser && targetUser.department) resolvedDept = targetUser.department;
    }
    if (!resolvedDept) resolvedDept = caseData.currentDepartment;

    await ForwardingHistory.create({ case: caseData._id, fromDepartment: fromDept, toDepartment: resolvedDept, fromUser, toUser, reason, priority: priority || caseData.priority, expectedAction, notes, dueDate, forwardedBy: req.user._id });

    caseData.currentDepartment = resolvedDept;
    if (toUser) caseData.currentAssignedUser = toUser;
    if (priority) caseData.priority = priority;
    caseData.currentStatus = newStatus || 'forwarded';
    await caseData.save();

    await addTimelineEvent({ caseId: caseData._id, eventType: 'forwarded', description: `Case forwarded: ${reason}`, fromDepartment: fromDept, toDepartment, fromUser, toUser, performedBy: req.user._id });
    await createAuditLog({ action: 'case_forwarded', entity: 'Case', entityId: caseData._id, caseId: caseData._id, newData: { toDepartment, toUser, reason }, performedBy: req.user._id, req });

    if (toUser) {
      await createNotification({ userId: toUser, title: 'New Case Assigned', message: `Case ${caseData.caseId} has been forwarded to you.`, type: 'case_forwarded', caseId: caseData._id });
    }

    res.json({ case: caseData, message: 'Case forwarded successfully' });
  } catch (error) {
    next(error);
  }
};

exports.returnCase = async (req, res, next) => {
  try {
    const { toDepartment, toUser, reason, notes } = req.body;
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: 'Case not found' });
    const fromDept = caseData.currentDepartment;

    await ForwardingHistory.create({ case: caseData._id, fromDepartment: fromDept, toDepartment, fromUser: caseData.currentAssignedUser, toUser, reason: `Returned: ${reason}`, forwardedBy: req.user._id });

    caseData.currentDepartment = toDepartment;
    if (toUser) caseData.currentAssignedUser = toUser;
    caseData.currentStatus = 'forwarded';
    await caseData.save();

    await addTimelineEvent({ caseId: caseData._id, eventType: 'returned', description: `Case returned: ${reason}`, fromDepartment: fromDept, toDepartment, performedBy: req.user._id });
    await createAuditLog({ action: 'case_returned', entity: 'Case', entityId: caseData._id, caseId: caseData._id, newData: { toDepartment, reason }, performedBy: req.user._id, req });

    if (toUser) {
      await createNotification({ userId: toUser, title: 'Case Returned', message: `Case ${caseData.caseId} has been returned to you.`, type: 'case_returned', caseId: caseData._id });
    }

    res.json({ case: caseData, message: 'Case returned successfully' });
  } catch (error) {
    next(error);
  }
};

exports.addNote = async (req, res, next) => {
  try {
    const { text, noteType, followUpDate } = req.body;
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: 'Case not found' });
    const note = await Note.create({ case: caseData._id, text, noteType: noteType || 'visible', followUpDate, createdBy: req.user._id, department: req.user.department });
    await addTimelineEvent({ caseId: caseData._id, eventType: 'note_added', description: `${noteType || 'visible'} note added`, performedBy: req.user._id });
    const populated = await Note.findById(note._id).populate('createdBy', 'firstName lastName').populate('department', 'name');
    res.status(201).json({ note: populated });
  } catch (error) {
    next(error);
  }
};

exports.editNote = async (req, res, next) => {
  try {
    const { text, reason } = req.body;
    const note = await Note.findById(req.params.noteId);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Can only edit own remarks' });
    }
    note.versionHistory.push({ previousText: note.text, newText: text, editedBy: req.user._id, reason });
    note.text = text;
    await note.save();
    await addTimelineEvent({ caseId: note.case, eventType: 'remark_edited', description: `Note edited. Reason: ${reason || 'No reason provided'}`, performedBy: req.user._id });
    await createAuditLog({ action: 'note_edited', entity: 'Note', entityId: note._id, caseId: note.case, previousData: { text: note.versionHistory[note.versionHistory.length - 1].previousText }, newData: { text }, performedBy: req.user._id, req });
    const populated = await Note.findById(note._id).populate('createdBy', 'firstName lastName').populate('versionHistory.editedBy', 'firstName lastName');
    res.json({ note: populated });
  } catch (error) {
    next(error);
  }
};

exports.markVisitorExit = async (req, res, next) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: 'Case not found' });
    caseData.exitTime = req.body.exitTime || new Date();
    await caseData.save();
    await addTimelineEvent({ caseId: caseData._id, eventType: 'visitor_exit', description: `Visitor exit recorded at ${caseData.exitTime.toLocaleString()}`, performedBy: req.user._id });
    res.json({ case: caseData });
  } catch (error) {
    next(error);
  }
};

exports.closeCase = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: 'Case not found' });
    caseData.currentStatus = 'closed';
    await caseData.save();
    await addTimelineEvent({ caseId: caseData._id, eventType: 'case_closed', description: `Case closed. Reason: ${reason || 'No reason'}`, performedBy: req.user._id });
    await createAuditLog({ action: 'case_closed', entity: 'Case', entityId: caseData._id, caseId: caseData._id, newData: { reason }, performedBy: req.user._id, req });
    res.json({ case: caseData });
  } catch (error) {
    next(error);
  }
};

exports.reopenCase = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: 'Case not found' });
    caseData.currentStatus = 'reopened';
    await caseData.save();
    await addTimelineEvent({ caseId: caseData._id, eventType: 'case_reopened', description: `Case reopened. Reason: ${reason || 'No reason'}`, performedBy: req.user._id });
    await createAuditLog({ action: 'case_reopened', entity: 'Case', entityId: caseData._id, caseId: caseData._id, newData: { reason }, performedBy: req.user._id, req });
    res.json({ case: caseData });
  } catch (error) {
    next(error);
  }
};

exports.softDeleteCase = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: 'Case not found' });
    caseData.isDeleted = true;
    caseData.deletedBy = req.user._id;
    caseData.deletedAt = new Date();
    caseData.deleteReason = reason;
    caseData.currentStatus = 'soft_deleted';
    await caseData.save();
    await addTimelineEvent({ caseId: caseData._id, eventType: 'case_soft_deleted', description: `Case soft deleted. Reason: ${reason}`, performedBy: req.user._id });
    await createAuditLog({ action: 'case_soft_deleted', entity: 'Case', entityId: caseData._id, caseId: caseData._id, newData: { reason }, performedBy: req.user._id, req });
    res.json({ message: 'Case soft deleted' });
  } catch (error) {
    next(error);
  }
};

exports.convertToAdmission = async (req, res, next) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: 'Case not found' });
    const prevPurpose = caseData.purposeCategory;
    caseData.purposeCategory = 'admission_enquiry';
    caseData.currentStatus = 'converted_to_admission';
    await caseData.save();
    await addTimelineEvent({ caseId: caseData._id, eventType: 'converted_to_admission', description: `Case converted from ${prevPurpose.replace(/_/g, ' ')} to Admission Enquiry`, performedBy: req.user._id });
    await createAuditLog({ action: 'converted_to_admission', entity: 'Case', entityId: caseData._id, caseId: caseData._id, previousData: { purposeCategory: prevPurpose }, newData: { purposeCategory: 'admission_enquiry' }, performedBy: req.user._id, req });
    res.json({ case: caseData, message: 'Case converted to admission enquiry' });
  } catch (error) {
    next(error);
  }
};

exports.generatePDF = async (req, res, next) => {
  try {
    const { type } = req.body;
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: 'Case not found' });
    let receipt;
    if (type === 'visitor_entry') {
      receipt = await generateVisitorEntryPDF(caseData, req.user._id);
    } else if (type === 'case_summary') {
      const timeline = await TimelineEvent.find({ case: caseData._id }).sort({ createdAt: 1 });
      const notes = await Note.find({ case: caseData._id }).sort({ createdAt: -1 });
      receipt = await generateCaseSummaryPDF(caseData, timeline, notes, req.user._id);
    } else {
      receipt = await generateVisitorEntryPDF(caseData, req.user._id);
    }
    await addTimelineEvent({ caseId: caseData._id, eventType: 'pdf_generated', description: `PDF generated: ${type || 'visitor_entry'}`, performedBy: req.user._id });
    res.json({ receipt });
  } catch (error) {
    next(error);
  }
};

exports.getTodayVisitors = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const cases = await Case.find({ createdAt: { $gte: today, $lt: tomorrow }, isDeleted: false })
      .populate('currentDepartment', 'name code')
      .populate('currentAssignedUser', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ cases, total: cases.length });
  } catch (error) {
    next(error);
  }
};

exports.getMyCases = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const filter = { createdBy: req.user._id, isDeleted: false };
    const cases = await Case.find(filter)
      .populate('currentDepartment', 'name code')
      .populate('currentAssignedUser', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Case.countDocuments(filter);
    res.json({ cases, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

exports.getAssignedCases = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = { currentAssignedUser: req.user._id, isDeleted: false };
    if (status) filter.currentStatus = status;
    const cases = await Case.find(filter)
      .populate('currentDepartment', 'name code')
      .populate('createdBy', 'firstName lastName')
      .populate('preferredCourse', 'name code')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Case.countDocuments(filter);
    res.json({ cases, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

exports.getDepartmentCases = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const deptId = req.params.departmentId || (req.user.department ? req.user.department._id : null);
    if (!deptId) return res.status(400).json({ message: 'Department not found' });
    const filter = { currentDepartment: deptId, isDeleted: false };
    if (status) filter.currentStatus = status;
    const cases = await Case.find(filter)
      .populate('currentDepartment', 'name code')
      .populate('currentAssignedUser', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .populate('preferredCourse', 'name code')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Case.countDocuments(filter);
    res.json({ cases, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};
