const Case = require('../models/Case');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');
const LoginLog = require('../models/LoginLog');
const CorrectionRequest = require('../models/CorrectionRequest');
const Note = require('../models/Note');
const User = require('../models/User');

const buildDateFilter = (startDate, endDate) => {
  const filter = {};
  if (startDate) filter.$gte = new Date(startDate);
  if (endDate) filter.$lte = new Date(endDate + 'T23:59:59.999Z');
  return Object.keys(filter).length > 0 ? filter : undefined;
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalVisitorsToday, totalCases, pendingCases, admissionEnquiries,
      hotLeads, warmLeads, coldLeads, todayPayments, totalPaymentsToday,
      pendingCorrections, recentLogins,
    ] = await Promise.all([
      Case.countDocuments({ createdAt: { $gte: today, $lt: tomorrow }, isDeleted: false }),
      Case.countDocuments({ isDeleted: false }),
      Case.countDocuments({ currentStatus: { $nin: ['closed', 'admitted', 'soft_deleted'] }, isDeleted: false }),
      Case.countDocuments({ purposeCategory: 'admission_enquiry', isDeleted: false }),
      Case.countDocuments({ leadTemperature: 'hot', currentStatus: { $nin: ['closed', 'admitted'] }, isDeleted: false }),
      Case.countDocuments({ leadTemperature: 'warm', currentStatus: { $nin: ['closed', 'admitted'] }, isDeleted: false }),
      Case.countDocuments({ leadTemperature: 'cold', currentStatus: { $nin: ['closed', 'admitted'] }, isDeleted: false }),
      Payment.countDocuments({ createdAt: { $gte: today, $lt: tomorrow }, isCancelled: false }),
      Payment.aggregate([{ $match: { createdAt: { $gte: today, $lt: tomorrow }, isCancelled: false } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      CorrectionRequest.countDocuments({ status: 'pending' }),
      LoginLog.find({ action: 'login', success: true }).sort({ createdAt: -1 }).limit(10).populate('user', 'firstName lastName username'),
    ]);

    const purposeBreakdown = await Case.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$purposeCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const statusBreakdown = await Case.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$currentStatus', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const departmentBreakdown = await Case.aggregate([
      { $match: { isDeleted: false, currentDepartment: { $ne: null } } },
      { $group: { _id: '$currentDepartment', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      totalVisitorsToday,
      totalCases,
      pendingCases,
      admissionEnquiries,
      hotLeads,
      warmLeads,
      coldLeads,
      todayPayments,
      feeCollectionToday: totalPaymentsToday[0]?.total || 0,
      pendingCorrections,
      recentLogins,
      purposeBreakdown,
      statusBreakdown,
      departmentBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

exports.getReceptionistReport = async (req, res, next) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const filter = { isDeleted: false };
    const dateFilter = buildDateFilter(startDate, endDate);
    if (dateFilter) filter.createdAt = dateFilter;
    if (userId) filter.createdBy = userId;
    const cases = await Case.find(filter)
      .populate('createdBy', 'firstName lastName')
      .populate('currentDepartment', 'name')
      .sort({ createdAt: -1 });
    const summary = await Case.aggregate([
      { $match: filter },
      { $group: { _id: '$createdBy', total: { $sum: 1 }, forwarded: { $sum: { $cond: [{ $ne: ['$currentStatus', 'new'] }, 1, 0] } } } },
    ]);
    res.json({ cases, summary, total: cases.length });
  } catch (error) {
    next(error);
  }
};

exports.getCounsellorReport = async (req, res, next) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const filter = { isDeleted: false, purposeCategory: 'admission_enquiry' };
    const dateFilter = buildDateFilter(startDate, endDate);
    if (dateFilter) filter.createdAt = dateFilter;
    if (userId) filter.currentAssignedUser = userId;
    const cases = await Case.find(filter).populate('currentAssignedUser', 'firstName lastName').populate('preferredCourse', 'name');
    const conversionStats = await Case.aggregate([
      { $match: filter },
      { $group: { _id: '$leadTemperature', count: { $sum: 1 } } },
    ]);
    res.json({ cases, conversionStats, total: cases.length });
  } catch (error) {
    next(error);
  }
};

exports.getFeeReport = async (req, res, next) => {
  try {
    const { startDate, endDate, paymentMode } = req.query;
    const filter = { isCancelled: false };
    const dateFilter = buildDateFilter(startDate, endDate);
    if (dateFilter) filter.createdAt = dateFilter;
    if (paymentMode) filter.paymentMode = paymentMode;
    const payments = await Payment.find(filter)
      .populate({ path: 'case', select: 'caseId visitorName studentName' })
      .populate('recordedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    const summary = await Payment.aggregate([
      { $match: filter },
      { $group: { _id: '$paymentMode', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const grandTotal = await Payment.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    res.json({ payments, summary, grandTotal: grandTotal[0]?.total || 0, total: payments.length });
  } catch (error) {
    next(error);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, entity, action, userId, startDate, endDate } = req.query;
    const filter = {};
    if (entity) filter.entity = entity;
    if (action) filter.action = { $regex: action, $options: 'i' };
    if (userId) filter.performedBy = userId;
    const dateFilter = buildDateFilter(startDate, endDate);
    if (dateFilter) filter.createdAt = dateFilter;
    const logs = await AuditLog.find(filter)
      .populate('performedBy', 'firstName lastName username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await AuditLog.countDocuments(filter);
    res.json({ logs, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

exports.getLoginLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, userId, action, startDate, endDate } = req.query;
    const filter = {};
    if (userId) filter.user = userId;
    if (action) filter.action = action;
    const dateFilter = buildDateFilter(startDate, endDate);
    if (dateFilter) filter.createdAt = dateFilter;
    const logs = await LoginLog.find(filter)
      .populate('user', 'firstName lastName username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await LoginLog.countDocuments(filter);
    res.json({ logs, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

exports.getStaffPerformance = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { isDeleted: false };
    const dateFilter = buildDateFilter(startDate, endDate);
    if (dateFilter) filter.createdAt = dateFilter;

    const createdByUser = await Case.aggregate([
      { $match: filter },
      { $group: { _id: '$createdBy', totalCreated: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { totalCreated: 1, 'user.firstName': 1, 'user.lastName': 1, 'user.username': 1 } },
      { $sort: { totalCreated: -1 } },
    ]);

    const assignedByUser = await Case.aggregate([
      { $match: { ...filter, currentAssignedUser: { $ne: null } } },
      { $group: { _id: '$currentAssignedUser', totalAssigned: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { totalAssigned: 1, 'user.firstName': 1, 'user.lastName': 1, 'user.username': 1 } },
      { $sort: { totalAssigned: -1 } },
    ]);

    res.json({ createdByUser, assignedByUser });
  } catch (error) {
    next(error);
  }
};

exports.getPendingFollowUps = async (req, res, next) => {
  try {
    const now = new Date();
    const overdue = await Note.find({ followUpDate: { $lte: now }, followUpCompleted: false })
      .populate('case', 'caseId visitorName studentName mobile currentStatus')
      .populate('createdBy', 'firstName lastName')
      .sort({ followUpDate: 1 });
    const upcoming = await Note.find({ followUpDate: { $gt: now }, followUpCompleted: false })
      .populate('case', 'caseId visitorName studentName mobile currentStatus')
      .populate('createdBy', 'firstName lastName')
      .sort({ followUpDate: 1 })
      .limit(50);
    res.json({ overdue, upcoming, overdueCount: overdue.length, upcomingCount: upcoming.length });
  } catch (error) {
    next(error);
  }
};
