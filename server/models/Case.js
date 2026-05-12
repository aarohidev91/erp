const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const PURPOSE_CATEGORIES = [
  'admission_enquiry', 'course_information', 'fee_enquiry',
  'document_submission', 'document_collection', 'registrar_work',
  'practical_examiner_visit', 'external_teacher_visit', 'guest_faculty_visit',
  'workshop_seminar_visit', 'placement_company_visit', 'vendor_supplier_visit',
  'parent_meeting', 'student_complaint', 'parent_complaint',
  'scholarship_enquiry', 'hostel_enquiry', 'transport_enquiry',
  'library_lab_work', 'exam_practical_work', 'certificate_degree_work',
  'alumni_visit', 'government_official_visit', 'general_enquiry', 'custom',
];

const CASE_STATUSES = [
  'new', 'received_at_reception', 'forwarded', 'in_progress',
  'assigned_to_counsellor', 'counselling_in_progress', 'follow_up_required',
  'forwarded_to_department', 'department_reviewed',
  'forwarded_to_accounts', 'fee_pending', 'fee_partially_paid', 'fee_completed',
  'forwarded_to_registrar', 'document_verification', 'pending_documents',
  'under_verification', 'verified', 'admission_approved', 'admission_rejected',
  'admission_cancelled', 'admitted',
  'forwarded_to_event_coordinator', 'event_scheduled', 'event_completed',
  'visit_completed', 'payment_pending', 'payment_completed',
  'interested_in_admission', 'course_discussed', 'not_interested',
  'converted_to_admission', 'completed', 'closed', 'reopened', 'soft_deleted',
];

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const VISITOR_TYPES = [
  'student', 'parent', 'guardian', 'teacher', 'practical_examiner',
  'guest_faculty', 'workshop_speaker', 'vendor', 'alumni', 'company_representative',
  'government_official', 'general', 'other',
];

const LEAD_TEMPERATURES = ['hot', 'warm', 'cold', 'not_interested'];

const SOURCES = [
  'walk_in', 'phone', 'email', 'website', 'social_media',
  'referral', 'newspaper', 'event', 'other',
];

const caseSchema = new mongoose.Schema({
  caseId: { type: String, unique: true, default: () => `CASE-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}` },
  visitorName: { type: String, required: true, trim: true },
  visitorType: { type: String, enum: VISITOR_TYPES, default: 'general' },
  studentName: { type: String, trim: true },
  parentName: { type: String, trim: true },
  mobile: { type: String, required: true, trim: true },
  alternateMobile: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  numberOfPeople: { type: Number, default: 1 },
  visitorPhoto: { type: String },
  idProof: { type: String },
  vehicleNumber: { type: String, trim: true },
  entryTime: { type: Date, default: Date.now },
  exitTime: { type: Date },

  purposeCategory: { type: String, enum: PURPOSE_CATEGORIES, required: true },
  customPurposeTitle: { type: String, trim: true },
  customPurposeDescription: { type: String, trim: true },

  source: { type: String, enum: SOURCES, default: 'walk_in' },
  priority: { type: String, enum: PRIORITIES, default: 'medium' },
  currentStatus: { type: String, enum: CASE_STATUSES, default: 'new' },
  currentDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  currentAssignedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  leadTemperature: { type: String, enum: [...LEAD_TEMPERATURES, ''] },
  counsellingStatus: { type: String, trim: true },
  preferredCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  alternateCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  eligibilityDetails: { type: String, trim: true },
  budgetConcern: { type: String, trim: true },
  scholarshipDiscussion: { type: String, trim: true },
  hostelRequired: { type: Boolean, default: false },
  transportRequired: { type: Boolean, default: false },

  departmentRecommendation: { type: String, enum: ['recommended', 'not_recommended', 'needs_discussion', 'eligibility_issue', ''] },

  examinerName: { type: String, trim: true },
  examinerInstitution: { type: String, trim: true },
  examinerSubject: { type: String, trim: true },
  examinerContact: { type: String, trim: true },
  concernedFaculty: { type: String, trim: true },

  guestSpeakerName: { type: String, trim: true },
  guestOrganization: { type: String, trim: true },
  eventTopic: { type: String, trim: true },
  eventSchedule: { type: String, trim: true },
  eventVenue: { type: String, trim: true },
  eventRequirements: { type: String, trim: true },
  honorariumDiscussion: { type: String, trim: true },
  responsibleCoordinator: { type: String, trim: true },

  vendorCompany: { type: String, trim: true },
  vendorContactPerson: { type: String, trim: true },
  vendorPurpose: { type: String, trim: true },

  applicationNumber: { type: String, trim: true },
  enrollmentNumber: { type: String, trim: true },
  rollNumber: { type: String, trim: true },
  batch: { type: String, trim: true },
  session: { type: String, trim: true },
  section: { type: String, trim: true },

  lockedAfterSubmit: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date },
  deleteReason: { type: String, trim: true },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

caseSchema.index({ caseId: 1 });
caseSchema.index({ mobile: 1 });
caseSchema.index({ visitorName: 'text', studentName: 'text', parentName: 'text', email: 'text' });
caseSchema.index({ currentStatus: 1, currentDepartment: 1 });
caseSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('Case', caseSchema);
module.exports.PURPOSE_CATEGORIES = PURPOSE_CATEGORIES;
module.exports.CASE_STATUSES = CASE_STATUSES;
module.exports.PRIORITIES = PRIORITIES;
module.exports.VISITOR_TYPES = VISITOR_TYPES;
module.exports.LEAD_TEMPERATURES = LEAD_TEMPERATURES;
module.exports.SOURCES = SOURCES;
