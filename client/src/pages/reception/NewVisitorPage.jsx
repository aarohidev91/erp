import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PURPOSE_OPTIONS = [
  { value: 'admission_enquiry', label: 'Admission Enquiry' },
  { value: 'course_information', label: 'Course Information' },
  { value: 'fee_enquiry', label: 'Fee Enquiry' },
  { value: 'document_submission', label: 'Document Submission' },
  { value: 'document_collection', label: 'Document Collection' },
  { value: 'registrar_work', label: 'Registrar Work' },
  { value: 'practical_examiner_visit', label: 'Practical Examiner Visit' },
  { value: 'external_teacher_visit', label: 'External Teacher Visit' },
  { value: 'guest_faculty_visit', label: 'Guest Faculty Visit' },
  { value: 'workshop_seminar_visit', label: 'Workshop / Seminar Speaker Visit' },
  { value: 'placement_company_visit', label: 'Placement / Company Visit' },
  { value: 'vendor_supplier_visit', label: 'Vendor / Supplier Visit' },
  { value: 'parent_meeting', label: 'Parent Meeting' },
  { value: 'student_complaint', label: 'Student Complaint' },
  { value: 'parent_complaint', label: 'Parent Complaint' },
  { value: 'scholarship_enquiry', label: 'Scholarship Enquiry' },
  { value: 'hostel_enquiry', label: 'Hostel Enquiry' },
  { value: 'transport_enquiry', label: 'Transport Enquiry' },
  { value: 'library_lab_work', label: 'Library / Lab Related Work' },
  { value: 'exam_practical_work', label: 'Exam / Practical Related Work' },
  { value: 'certificate_degree_work', label: 'Certificate / Degree / Marksheet Work' },
  { value: 'alumni_visit', label: 'Alumni Visit' },
  { value: 'government_official_visit', label: 'Government / Official Visit' },
  { value: 'general_enquiry', label: 'General Enquiry' },
  { value: 'custom', label: 'Custom Purpose' },
];

const VISITOR_TYPES = [
  { value: 'student', label: 'Student' }, { value: 'parent', label: 'Parent' },
  { value: 'guardian', label: 'Guardian' }, { value: 'teacher', label: 'Teacher' },
  { value: 'practical_examiner', label: 'Practical Examiner' }, { value: 'guest_faculty', label: 'Guest Faculty' },
  { value: 'workshop_speaker', label: 'Workshop Speaker' }, { value: 'vendor', label: 'Vendor' },
  { value: 'alumni', label: 'Alumni' }, { value: 'company_representative', label: 'Company Representative' },
  { value: 'government_official', label: 'Government Official' }, { value: 'general', label: 'General' },
  { value: 'other', label: 'Other' },
];

export default function NewVisitorPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    visitorName: '', visitorType: 'general', studentName: '', parentName: '',
    mobile: '', alternateMobile: '', email: '', address: '', city: '', state: '',
    numberOfPeople: 1, vehicleNumber: '', purposeCategory: 'general_enquiry',
    customPurposeTitle: '', customPurposeDescription: '', source: 'walk_in',
    priority: 'medium', currentDepartment: '', preferredCourse: '',
    examinerName: '', examinerInstitution: '', examinerSubject: '', examinerContact: '', concernedFaculty: '',
    guestSpeakerName: '', guestOrganization: '', eventTopic: '', eventSchedule: '',
    eventVenue: '', eventRequirements: '', honorariumDiscussion: '', responsibleCoordinator: '',
    vendorCompany: '', vendorContactPerson: '', vendorPurpose: '',
    hostelRequired: false, transportRequired: false,
  });

  useEffect(() => {
    api.get('/departments').then(({ data }) => setDepartments(data.departments || [])).catch(() => {});
    api.get('/courses').then(({ data }) => setCourses(data.courses || [])).catch(() => {});
  }, []);

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.visitorName || !form.mobile || !form.purposeCategory) {
      return toast.error('Please fill required fields');
    }
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.currentDepartment) delete payload.currentDepartment;
      if (!payload.preferredCourse) delete payload.preferredCourse;
      const { data } = await api.post('/cases', payload);
      toast.success(`Case created: ${data.case.caseId}`);
      navigate(`/cases/${data.case._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  const isCustom = form.purposeCategory === 'custom';
  const isPractical = form.purposeCategory === 'practical_examiner_visit';
  const isWorkshop = ['workshop_seminar_visit', 'guest_faculty_visit'].includes(form.purposeCategory);
  const isVendor = form.purposeCategory === 'vendor_supplier_visit';
  const isAdmission = form.purposeCategory === 'admission_enquiry';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Visitor Entry</h1>
        <p className="text-gray-500 mt-1">Create a new visitor / enquiry record</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">Basic Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Name *</label>
              <input type="text" value={form.visitorName} onChange={(e) => updateForm('visitorName', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Type</label>
              <select value={form.visitorType} onChange={(e) => updateForm('visitorType', e.target.value)} className="select-field">
                {VISITOR_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
              <input type="tel" value={form.mobile} onChange={(e) => updateForm('mobile', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
              <input type="text" value={form.studentName} onChange={(e) => updateForm('studentName', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent / Guardian Name</label>
              <input type="text" value={form.parentName} onChange={(e) => updateForm('parentName', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Mobile</label>
              <input type="tel" value={form.alternateMobile} onChange={(e) => updateForm('alternateMobile', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={form.address} onChange={(e) => updateForm('address', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" value={form.city} onChange={(e) => updateForm('city', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input type="text" value={form.state} onChange={(e) => updateForm('state', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. of People</label>
              <input type="number" min="1" value={form.numberOfPeople} onChange={(e) => updateForm('numberOfPeople', parseInt(e.target.value))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
              <input type="text" value={form.vehicleNumber} onChange={(e) => updateForm('vehicleNumber', e.target.value)} className="input-field" />
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">Purpose & Classification</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose Category *</label>
              <select value={form.purposeCategory} onChange={(e) => updateForm('purposeCategory', e.target.value)} className="select-field" required>
                {PURPOSE_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select value={form.source} onChange={(e) => updateForm('source', e.target.value)} className="select-field">
                {['walk_in', 'phone', 'email', 'website', 'social_media', 'referral', 'newspaper', 'event', 'other'].map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={form.priority} onChange={(e) => updateForm('priority', e.target.value)} className="select-field">
                {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select value={form.currentDepartment} onChange={(e) => updateForm('currentDepartment', e.target.value)} className="select-field">
                <option value="">Select Department</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            {(isAdmission || form.purposeCategory === 'course_information') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Course</label>
                <select value={form.preferredCourse} onChange={(e) => updateForm('preferredCourse', e.target.value)} className="select-field">
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            )}
          </div>
          {isCustom && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Purpose Title *</label>
                <input type="text" value={form.customPurposeTitle} onChange={(e) => updateForm('customPurposeTitle', e.target.value)} className="input-field" required={isCustom} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.customPurposeDescription} onChange={(e) => updateForm('customPurposeDescription', e.target.value)} className="input-field" rows="2" />
              </div>
            </div>
          )}
          {isAdmission && (
            <div className="flex gap-4 mt-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.hostelRequired} onChange={(e) => updateForm('hostelRequired', e.target.checked)} className="rounded" />
                Hostel Required
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.transportRequired} onChange={(e) => updateForm('transportRequired', e.target.checked)} className="rounded" />
                Transport Required
              </label>
            </div>
          )}
        </div>

        {isPractical && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">Practical Examiner Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Examiner Name</label><input type="text" value={form.examinerName} onChange={(e) => updateForm('examinerName', e.target.value)} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Institution</label><input type="text" value={form.examinerInstitution} onChange={(e) => updateForm('examinerInstitution', e.target.value)} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Subject / Practical</label><input type="text" value={form.examinerSubject} onChange={(e) => updateForm('examinerSubject', e.target.value)} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact</label><input type="text" value={form.examinerContact} onChange={(e) => updateForm('examinerContact', e.target.value)} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Concerned Faculty / HOD</label><input type="text" value={form.concernedFaculty} onChange={(e) => updateForm('concernedFaculty', e.target.value)} className="input-field" /></div>
            </div>
          </div>
        )}

        {isWorkshop && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">Workshop / Guest Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Speaker Name</label><input type="text" value={form.guestSpeakerName} onChange={(e) => updateForm('guestSpeakerName', e.target.value)} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Organization</label><input type="text" value={form.guestOrganization} onChange={(e) => updateForm('guestOrganization', e.target.value)} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Event Topic</label><input type="text" value={form.eventTopic} onChange={(e) => updateForm('eventTopic', e.target.value)} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label><input type="text" value={form.eventSchedule} onChange={(e) => updateForm('eventSchedule', e.target.value)} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Venue</label><input type="text" value={form.eventVenue} onChange={(e) => updateForm('eventVenue', e.target.value)} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label><input type="text" value={form.eventRequirements} onChange={(e) => updateForm('eventRequirements', e.target.value)} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Honorarium Discussion</label><input type="text" value={form.honorariumDiscussion} onChange={(e) => updateForm('honorariumDiscussion', e.target.value)} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Responsible Coordinator</label><input type="text" value={form.responsibleCoordinator} onChange={(e) => updateForm('responsibleCoordinator', e.target.value)} className="input-field" /></div>
            </div>
          </div>
        )}

        {isVendor && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">Vendor Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Vendor Company</label><input type="text" value={form.vendorCompany} onChange={(e) => updateForm('vendorCompany', e.target.value)} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label><input type="text" value={form.vendorContactPerson} onChange={(e) => updateForm('vendorContactPerson', e.target.value)} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label><input type="text" value={form.vendorPurpose} onChange={(e) => updateForm('vendorPurpose', e.target.value)} className="input-field" /></div>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Creating...' : 'Create Entry'}</button>
        </div>
      </form>
    </div>
  );
}
