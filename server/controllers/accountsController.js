const FeeStructure = require('../models/FeeStructure');
const Payment = require('../models/Payment');
const Installment = require('../models/Installment');
const Case = require('../models/Case');
const { addTimelineEvent } = require('../utils/timelineHelper');
const { createAuditLog } = require('../middleware/auditLogger');
const { generateFeeReceiptPDF } = require('../services/pdfService');
const { v4: uuidv4 } = require('uuid');

exports.createFeeStructure = async (req, res, next) => {
  try {
    const caseData = await Case.findById(req.params.caseId);
    if (!caseData) return res.status(404).json({ message: 'Case not found' });
    const feeStructure = await FeeStructure.create({ ...req.body, case: caseData._id, createdBy: req.user._id });
    await addTimelineEvent({ caseId: caseData._id, eventType: 'fee_quotation_created', description: `Fee quotation created. Net payable: ₹${feeStructure.netPayable}`, performedBy: req.user._id });
    await createAuditLog({ action: 'fee_structure_created', entity: 'FeeStructure', entityId: feeStructure._id, caseId: caseData._id, newData: { totalFee: feeStructure.totalFee, netPayable: feeStructure.netPayable }, performedBy: req.user._id, req });
    const populated = await FeeStructure.findById(feeStructure._id).populate('course', 'name code').populate('createdBy', 'firstName lastName');
    res.status(201).json({ feeStructure: populated });
  } catch (error) {
    next(error);
  }
};

exports.recordPayment = async (req, res, next) => {
  try {
    const caseData = await Case.findById(req.params.caseId);
    if (!caseData) return res.status(404).json({ message: 'Case not found' });
    const receiptNumber = `PAY-${Date.now()}-${uuidv4().slice(0, 4).toUpperCase()}`;
    const payment = await Payment.create({ ...req.body, case: caseData._id, receiptNumber, recordedBy: req.user._id });

    await addTimelineEvent({ caseId: caseData._id, eventType: 'payment_recorded', description: `Payment recorded: ₹${payment.amount} via ${payment.paymentMode.replace(/_/g, ' ')}`, performedBy: req.user._id });
    await createAuditLog({ action: 'payment_recorded', entity: 'Payment', entityId: payment._id, caseId: caseData._id, newData: { amount: payment.amount, mode: payment.paymentMode, receiptNumber }, performedBy: req.user._id, req });

    const receipt = await generateFeeReceiptPDF(caseData, payment, req.user._id);
    await addTimelineEvent({ caseId: caseData._id, eventType: 'pdf_generated', description: 'Fee receipt PDF generated', performedBy: req.user._id });

    const populated = await Payment.findById(payment._id).populate('recordedBy', 'firstName lastName');
    res.status(201).json({ payment: populated, receipt });
  } catch (error) {
    next(error);
  }
};

exports.cancelPayment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    payment.isCancelled = true;
    payment.status = 'cancelled';
    payment.cancelReason = reason;
    payment.cancelledBy = req.user._id;
    payment.cancelledAt = new Date();
    await payment.save();
    await addTimelineEvent({ caseId: payment.case, eventType: 'payment_cancelled', description: `Payment ${payment.receiptNumber} cancelled. Reason: ${reason}`, performedBy: req.user._id });
    await createAuditLog({ action: 'payment_cancelled', entity: 'Payment', entityId: payment._id, caseId: payment.case, newData: { reason }, performedBy: req.user._id, req });
    res.json({ payment, message: 'Payment cancelled' });
  } catch (error) {
    next(error);
  }
};

exports.createInstallments = async (req, res, next) => {
  try {
    const { installments } = req.body;
    const caseData = await Case.findById(req.params.caseId);
    if (!caseData) return res.status(404).json({ message: 'Case not found' });
    const created = [];
    for (const inst of installments) {
      const installment = await Installment.create({ ...inst, case: caseData._id, createdBy: req.user._id });
      created.push(installment);
    }
    await addTimelineEvent({ caseId: caseData._id, eventType: 'installment_created', description: `${created.length} installments created`, performedBy: req.user._id });
    res.status(201).json({ installments: created });
  } catch (error) {
    next(error);
  }
};

exports.getPayments = async (req, res, next) => {
  try {
    const { caseId, status, startDate, endDate, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (caseId) filter.case = caseId;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }
    const payments = await Payment.find(filter)
      .populate({ path: 'case', select: 'caseId visitorName studentName mobile' })
      .populate('recordedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Payment.countDocuments(filter);
    const totalAmount = await Payment.aggregate([
      { $match: { ...filter, isCancelled: false } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    res.json({ payments, total, totalAmount: totalAmount[0]?.total || 0, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

exports.approveDiscount = async (req, res, next) => {
  try {
    const feeStructure = await FeeStructure.findById(req.params.feeStructureId);
    if (!feeStructure) return res.status(404).json({ message: 'Fee structure not found' });
    feeStructure.discountApproved = true;
    feeStructure.discountApprovedBy = req.user._id;
    await feeStructure.save();
    await addTimelineEvent({ caseId: feeStructure.case, eventType: 'discount_approved', description: `Discount of ₹${feeStructure.discount} approved`, performedBy: req.user._id });
    await createAuditLog({ action: 'discount_approved', entity: 'FeeStructure', entityId: feeStructure._id, caseId: feeStructure.case, newData: { discount: feeStructure.discount }, performedBy: req.user._id, req });
    res.json({ feeStructure });
  } catch (error) {
    next(error);
  }
};
