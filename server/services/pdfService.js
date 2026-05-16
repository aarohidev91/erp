const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const PDFReceipt = require('../models/PDFReceipt');

const uploadsDir = path.join(__dirname, '../uploads/pdfs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const COLLEGE_NAME = process.env.COLLEGE_NAME || 'College ERP System';

const generateReceiptNumber = (type) => {
  const prefix = type.toUpperCase().replace(/_/g, '').slice(0, 4);
  return `${prefix}-${Date.now()}-${uuidv4().slice(0, 4).toUpperCase()}`;
};

const addHeader = (doc, title) => {
  doc.fontSize(16).font('Helvetica-Bold').text(COLLEGE_NAME, { align: 'center' });
  doc.fontSize(10).font('Helvetica').text(title, { align: 'center' });
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);
};

const addRow = (doc, label, value, x, y) => {
  doc.font('Helvetica-Bold').fontSize(9).text(label + ':', x, y, { continued: false });
  doc.font('Helvetica').fontSize(9).text(value || 'N/A', x + 120, y);
};

const addFooter = (doc) => {
  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.3);
  doc.fontSize(7).font('Helvetica').text('This is a system-generated receipt. No signature required.', { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
};

const generateVisitorEntryPDF = async (caseData, userId) => {
  const receiptNumber = generateReceiptNumber('visitor_entry');
  const fileName = `visitor_entry_${receiptNumber}.pdf`;
  const filePath = path.join(uploadsDir, fileName);

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  addHeader(doc, 'Visitor Entry Receipt');

  let y = doc.y;
  doc.fontSize(9).font('Helvetica-Bold').text(`Receipt #: ${receiptNumber}`, 50, y);
  doc.text(`Case ID: ${caseData.caseId}`, 350, y);
  y += 15;
  doc.text(`Date: ${new Date(caseData.entryTime).toLocaleDateString()}`, 50, y);
  doc.text(`Time: ${new Date(caseData.entryTime).toLocaleTimeString()}`, 350, y);
  doc.moveDown(1);

  y = doc.y;
  addRow(doc, 'Visitor Name', caseData.visitorName, 50, y); y += 15;
  addRow(doc, 'Visitor Type', caseData.visitorType, 50, y); y += 15;
  addRow(doc, 'Mobile', caseData.mobile, 50, y); y += 15;
  addRow(doc, 'Purpose', caseData.purposeCategory?.replace(/_/g, ' '), 50, y); y += 15;
  if (caseData.studentName) { addRow(doc, 'Student Name', caseData.studentName, 50, y); y += 15; }
  if (caseData.parentName) { addRow(doc, 'Parent Name', caseData.parentName, 50, y); y += 15; }
  addRow(doc, 'People Count', String(caseData.numberOfPeople || 1), 50, y); y += 15;
  addRow(doc, 'Status', caseData.currentStatus?.replace(/_/g, ' '), 50, y); y += 15;
  if (caseData.vehicleNumber) { addRow(doc, 'Vehicle No', caseData.vehicleNumber, 50, y); y += 15; }

  try {
    const qrData = `CASE:${caseData.caseId}|RCP:${receiptNumber}`;
    const qrBuffer = await QRCode.toBuffer(qrData, { width: 80 });
    doc.image(qrBuffer, 460, y, { width: 70 });
  } catch (_e) { /* skip QR if error */ }

  addFooter(doc);
  doc.end();

  await new Promise((resolve) => stream.on('finish', resolve));

  const receipt = await PDFReceipt.create({
    case: caseData._id,
    receiptNumber,
    receiptType: 'visitor_entry',
    filePath: `/uploads/pdfs/${fileName}`,
    generatedBy: userId,
  });

  return receipt;
};

const generateFeeReceiptPDF = async (caseData, paymentData, userId) => {
  const receiptNumber = generateReceiptNumber('fee_receipt');
  const fileName = `fee_receipt_${receiptNumber}.pdf`;
  const filePath = path.join(uploadsDir, fileName);

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  addHeader(doc, 'Fee Receipt');

  let y = doc.y;
  doc.fontSize(9).font('Helvetica-Bold').text(`Receipt #: ${receiptNumber}`, 50, y);
  doc.text(`Case ID: ${caseData.caseId}`, 350, y);
  y += 15;
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, y);
  doc.moveDown(1);

  y = doc.y;
  addRow(doc, 'Student Name', caseData.studentName || caseData.visitorName, 50, y); y += 15;
  addRow(doc, 'Mobile', caseData.mobile, 50, y); y += 15;
  addRow(doc, 'Amount', `₹${paymentData.amount}`, 50, y); y += 15;
  addRow(doc, 'Payment Mode', paymentData.paymentMode?.replace(/_/g, ' '), 50, y); y += 15;
  if (paymentData.transactionId) { addRow(doc, 'Transaction ID', paymentData.transactionId, 50, y); y += 15; }
  addRow(doc, 'Payment Status', paymentData.status, 50, y); y += 15;
  if (paymentData.description) { addRow(doc, 'Description', paymentData.description, 50, y); y += 15; }

  addFooter(doc);
  doc.end();

  await new Promise((resolve) => stream.on('finish', resolve));

  const receipt = await PDFReceipt.create({
    case: caseData._id,
    receiptNumber,
    receiptType: 'fee_receipt',
    filePath: `/uploads/pdfs/${fileName}`,
    generatedBy: userId,
  });

  return receipt;
};

const generateAdmissionConfirmationPDF = async (caseData, userId) => {
  const receiptNumber = generateReceiptNumber('admission_confirmation');
  const fileName = `admission_${receiptNumber}.pdf`;
  const filePath = path.join(uploadsDir, fileName);

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  addHeader(doc, 'Admission Confirmation');

  let y = doc.y;
  doc.fontSize(9).font('Helvetica-Bold').text(`Receipt #: ${receiptNumber}`, 50, y);
  doc.text(`Case ID: ${caseData.caseId}`, 350, y);
  y += 15;
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, y);
  doc.moveDown(1);

  y = doc.y;
  addRow(doc, 'Student Name', caseData.studentName || caseData.visitorName, 50, y); y += 15;
  addRow(doc, 'Parent Name', caseData.parentName, 50, y); y += 15;
  addRow(doc, 'Mobile', caseData.mobile, 50, y); y += 15;
  addRow(doc, 'Email', caseData.email, 50, y); y += 15;
  if (caseData.enrollmentNumber) { addRow(doc, 'Enrollment No', caseData.enrollmentNumber, 50, y); y += 15; }
  if (caseData.rollNumber) { addRow(doc, 'Roll Number', caseData.rollNumber, 50, y); y += 15; }
  if (caseData.batch) { addRow(doc, 'Batch', caseData.batch, 50, y); y += 15; }
  if (caseData.session) { addRow(doc, 'Session', caseData.session, 50, y); y += 15; }
  addRow(doc, 'Status', 'ADMITTED', 50, y); y += 15;

  addFooter(doc);
  doc.end();

  await new Promise((resolve) => stream.on('finish', resolve));

  const receipt = await PDFReceipt.create({
    case: caseData._id,
    receiptNumber,
    receiptType: 'admission_confirmation',
    filePath: `/uploads/pdfs/${fileName}`,
    generatedBy: userId,
  });

  return receipt;
};

const generateCaseSummaryPDF = async (caseData, timeline, notes, userId) => {
  const receiptNumber = generateReceiptNumber('case_summary');
  const fileName = `case_summary_${receiptNumber}.pdf`;
  const filePath = path.join(uploadsDir, fileName);

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  addHeader(doc, 'Case Summary Report');

  let y = doc.y;
  doc.fontSize(9).font('Helvetica-Bold').text(`Case ID: ${caseData.caseId}`, 50, y);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 350, y);
  doc.moveDown(1);

  y = doc.y;
  addRow(doc, 'Visitor Name', caseData.visitorName, 50, y); y += 15;
  addRow(doc, 'Purpose', caseData.purposeCategory?.replace(/_/g, ' '), 50, y); y += 15;
  addRow(doc, 'Mobile', caseData.mobile, 50, y); y += 15;
  addRow(doc, 'Status', caseData.currentStatus?.replace(/_/g, ' '), 50, y); y += 15;
  doc.moveDown(1);

  if (timeline && timeline.length > 0) {
    doc.fontSize(11).font('Helvetica-Bold').text('Timeline:', 50, doc.y);
    doc.moveDown(0.3);
    for (const event of timeline.slice(0, 20)) {
      doc.fontSize(8).font('Helvetica')
        .text(`[${new Date(event.createdAt).toLocaleString()}] ${event.eventType}: ${event.description}`, 60, doc.y, { width: 470 });
      doc.moveDown(0.2);
      if (doc.y > 720) { doc.addPage(); }
    }
  }

  if (notes && notes.length > 0) {
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica-Bold').text('Notes:', 50, doc.y);
    doc.moveDown(0.3);
    for (const note of notes.slice(0, 15)) {
      doc.fontSize(8).font('Helvetica')
        .text(`[${note.noteType}] ${note.text}`, 60, doc.y, { width: 470 });
      doc.moveDown(0.2);
      if (doc.y > 720) { doc.addPage(); }
    }
  }

  addFooter(doc);
  doc.end();

  await new Promise((resolve) => stream.on('finish', resolve));

  const receipt = await PDFReceipt.create({
    case: caseData._id,
    receiptNumber,
    receiptType: 'case_summary',
    filePath: `/uploads/pdfs/${fileName}`,
    generatedBy: userId,
  });

  return receipt;
};

module.exports = {
  generateVisitorEntryPDF,
  generateFeeReceiptPDF,
  generateAdmissionConfirmationPDF,
  generateCaseSummaryPDF,
};
