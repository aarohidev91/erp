import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

export default function CaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const [caseData, setCaseData] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState([]);
  const [forwardingHistory, setForwardingHistory] = useState([]);
  const [correctionRequests, setCorrectionRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchCase = async () => {
    try {
      const { data } = await api.get(`/cases/${id}`);
      setCaseData(data.case);
      setTimeline(data.timeline || []);
      setNotes(data.notes || []);
      setForwardingHistory(data.forwardingHistory || []);
      setCorrectionRequests(data.correctionRequests || []);
      setPayments(data.payments || []);
      setFeeStructures(data.feeStructures || []);
      setDocuments(data.documents || []);
      setChecklist(data.checklist || []);
      setReceipts(data.receipts || []);
    } catch (error) {
      toast.error('Failed to load case');
      navigate('/cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
    api.get('/departments').then(({ data }) => setDepartments(data.departments || [])).catch(() => {});
    api.get('/users?limit=100').then(({ data }) => setUsers(data.users || [])).catch(() => {});
  }, [id]);

  const [forwardForm, setForwardForm] = useState({ toDepartment: '', toUser: '', reason: '', priority: 'medium', expectedAction: '', notes: '', dueDate: '', newStatus: 'forwarded' });
  const [noteForm, setNoteForm] = useState({ text: '', noteType: 'visible', followUpDate: '' });
  const [correctionForm, setCorrectionForm] = useState({ fieldToCorrect: '', oldValue: '', requestedNewValue: '', reason: '' });

  const handleForward = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/cases/${id}/forward`, forwardForm);
      toast.success('Case forwarded');
      setShowForwardModal(false);
      setForwardForm({ toDepartment: '', toUser: '', reason: '', priority: 'medium', expectedAction: '', notes: '', dueDate: '', newStatus: 'forwarded' });
      fetchCase();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to forward');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/cases/${id}/notes`, noteForm);
      toast.success('Note added');
      setShowNoteModal(false);
      setNoteForm({ text: '', noteType: 'visible', followUpDate: '' });
      fetchCase();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add note');
    }
  };

  const handleCorrectionRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/correction-requests/case/${id}`, correctionForm);
      toast.success('Correction request submitted');
      setShowCorrectionModal(false);
      setCorrectionForm({ fieldToCorrect: '', oldValue: '', requestedNewValue: '', reason: '' });
      fetchCase();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit correction');
    }
  };

  const handleGeneratePDF = async (type) => {
    try {
      const { data } = await api.post(`/cases/${id}/pdf`, { type });
      toast.success('PDF generated');
      if (data.receipt?.filePath) window.open(data.receipt.filePath, '_blank');
      fetchCase();
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const handleMarkExit = async () => {
    try {
      await api.post(`/cases/${id}/exit`, { exitTime: new Date() });
      toast.success('Exit time recorded');
      fetchCase();
    } catch (error) {
      toast.error('Failed to mark exit');
    }
  };

  const handleConvertToAdmission = async () => {
    if (!confirm('Convert this case to Admission Enquiry?')) return;
    try {
      await api.post(`/cases/${id}/convert-admission`);
      toast.success('Converted to admission enquiry');
      fetchCase();
    } catch (error) {
      toast.error('Failed to convert');
    }
  };

  const handleCloseCase = async () => {
    const reason = prompt('Reason for closing:');
    if (!reason) return;
    try {
      await api.post(`/cases/${id}/close`, { reason });
      toast.success('Case closed');
      fetchCase();
    } catch (error) {
      toast.error('Failed to close case');
    }
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>;
  if (!caseData) return <div className="text-center py-12 text-gray-500">Case not found</div>;

  const c = caseData;
  const tabs = ['timeline', 'notes', 'forwarding', 'corrections', 'payments', 'documents', 'receipts'];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-secondary">← Back</button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{c.caseId}</h1>
            <StatusBadge status={c.currentStatus} />
            <span className="capitalize text-sm text-gray-500">Priority: <StatusBadge status={c.priority} /></span>
          </div>
          <p className="text-gray-500 mt-1">{c.visitorName} • {c.mobile} • {(c.purposeCategory || '').replace(/_/g, ' ')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Visitor / Case Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Visitor Name:</span> <span className="font-medium">{c.visitorName}</span></div>
              <div><span className="text-gray-500">Visitor Type:</span> <span className="font-medium capitalize">{(c.visitorType || '').replace(/_/g, ' ')}</span></div>
              {c.studentName && <div><span className="text-gray-500">Student Name:</span> <span className="font-medium">{c.studentName}</span></div>}
              {c.parentName && <div><span className="text-gray-500">Parent Name:</span> <span className="font-medium">{c.parentName}</span></div>}
              <div><span className="text-gray-500">Mobile:</span> <span className="font-medium">{c.mobile}</span></div>
              {c.alternateMobile && <div><span className="text-gray-500">Alternate Mobile:</span> <span className="font-medium">{c.alternateMobile}</span></div>}
              {c.email && <div><span className="text-gray-500">Email:</span> <span className="font-medium">{c.email}</span></div>}
              {c.address && <div><span className="text-gray-500">Address:</span> <span className="font-medium">{c.address}</span></div>}
              {c.city && <div><span className="text-gray-500">City/State:</span> <span className="font-medium">{c.city}{c.state ? `, ${c.state}` : ''}</span></div>}
              <div><span className="text-gray-500">Purpose:</span> <span className="font-medium capitalize">{(c.purposeCategory || '').replace(/_/g, ' ')}</span></div>
              {c.customPurposeTitle && <div><span className="text-gray-500">Custom Purpose:</span> <span className="font-medium">{c.customPurposeTitle}</span></div>}
              <div><span className="text-gray-500">Source:</span> <span className="font-medium capitalize">{(c.source || '').replace(/_/g, ' ')}</span></div>
              <div><span className="text-gray-500">Entry Time:</span> <span className="font-medium">{new Date(c.entryTime).toLocaleString()}</span></div>
              {c.exitTime && <div><span className="text-gray-500">Exit Time:</span> <span className="font-medium">{new Date(c.exitTime).toLocaleString()}</span></div>}
              <div><span className="text-gray-500">People Count:</span> <span className="font-medium">{c.numberOfPeople}</span></div>
              {c.vehicleNumber && <div><span className="text-gray-500">Vehicle:</span> <span className="font-medium">{c.vehicleNumber}</span></div>}
              <div><span className="text-gray-500">Department:</span> <span className="font-medium">{c.currentDepartment?.name || '-'}</span></div>
              <div><span className="text-gray-500">Assigned To:</span> <span className="font-medium">{c.currentAssignedUser ? `${c.currentAssignedUser.firstName} ${c.currentAssignedUser.lastName}` : '-'}</span></div>
              <div><span className="text-gray-500">Created By:</span> <span className="font-medium">{c.createdBy?.firstName} {c.createdBy?.lastName}</span></div>
              {c.leadTemperature && <div><span className="text-gray-500">Lead Temp:</span> <StatusBadge status={c.leadTemperature} /></div>}
              {c.preferredCourse && <div><span className="text-gray-500">Preferred Course:</span> <span className="font-medium">{c.preferredCourse.name}</span></div>}
              {c.enrollmentNumber && <div><span className="text-gray-500">Enrollment No:</span> <span className="font-medium">{c.enrollmentNumber}</span></div>}
              {c.rollNumber && <div><span className="text-gray-500">Roll Number:</span> <span className="font-medium">{c.rollNumber}</span></div>}
              {c.batch && <div><span className="text-gray-500">Batch:</span> <span className="font-medium">{c.batch}</span></div>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold mb-3">Actions</h3>
            <div className="space-y-2">
              {hasPermission('forward') && <button onClick={() => setShowForwardModal(true)} className="btn-primary w-full">Forward Case</button>}
              {hasPermission('add_note') && <button onClick={() => setShowNoteModal(true)} className="btn-secondary w-full">Add Note</button>}
              {hasPermission('request_correction') && <button onClick={() => setShowCorrectionModal(true)} className="btn-secondary w-full">Request Correction</button>}
              {hasPermission('download_pdf') && <button onClick={() => handleGeneratePDF('visitor_entry')} className="btn-secondary w-full">Generate Visitor PDF</button>}
              {hasPermission('download_pdf') && <button onClick={() => handleGeneratePDF('case_summary')} className="btn-secondary w-full">Generate Summary PDF</button>}
              {!c.exitTime && <button onClick={handleMarkExit} className="btn-secondary w-full">Mark Visitor Exit</button>}
              {c.purposeCategory === 'course_information' && hasPermission('edit_limited') && (
                <button onClick={handleConvertToAdmission} className="btn-success w-full">Convert to Admission</button>
              )}
              {hasPermission('close') && c.currentStatus !== 'closed' && (
                <button onClick={handleCloseCase} className="btn-danger w-full">Close Case</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex gap-1 border-b border-gray-200 mb-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab} {tab === 'corrections' && correctionRequests.length > 0 ? `(${correctionRequests.length})` : ''}
              {tab === 'notes' && notes.length > 0 ? `(${notes.length})` : ''}
              {tab === 'payments' && payments.length > 0 ? `(${payments.length})` : ''}
            </button>
          ))}
        </div>

        {activeTab === 'timeline' && (
          <div className="space-y-3">
            {timeline.length === 0 ? <p className="text-gray-500 text-center py-4">No timeline events</p> : timeline.map((event) => (
              <div key={event._id} className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{event.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {event.performedBy?.firstName} {event.performedBy?.lastName} • {new Date(event.createdAt).toLocaleString()}
                    {event.fromDepartment && ` • From: ${event.fromDepartment.name}`}
                    {event.toDepartment && ` • To: ${event.toDepartment.name}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-3">
            {notes.length === 0 ? <p className="text-gray-500 text-center py-4">No notes</p> : notes.map((note) => (
              <div key={note._id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge-blue capitalize">{note.noteType.replace(/_/g, ' ')}</span>
                  {note.followUpDate && <span className="text-xs text-orange-600">Follow-up: {new Date(note.followUpDate).toLocaleDateString()}</span>}
                </div>
                <p className="text-sm text-gray-900">{note.text}</p>
                <p className="text-xs text-gray-500 mt-1">{note.createdBy?.firstName} {note.createdBy?.lastName} • {note.department?.name || ''} • {new Date(note.createdAt).toLocaleString()}</p>
                {note.versionHistory?.length > 0 && (
                  <div className="mt-2 pl-3 border-l-2 border-gray-200">
                    <p className="text-xs font-medium text-gray-500 mb-1">Edit History:</p>
                    {note.versionHistory.map((v, i) => (
                      <div key={i} className="text-xs text-gray-500 mb-1">
                        <span className="line-through">{v.previousText}</span> → <span>{v.newText}</span>
                        <br />{v.editedBy?.firstName} {v.editedBy?.lastName} • {new Date(v.editedAt).toLocaleString()} {v.reason && `• Reason: ${v.reason}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'forwarding' && (
          <div className="space-y-3">
            {forwardingHistory.length === 0 ? <p className="text-gray-500 text-center py-4">No forwarding history</p> : forwardingHistory.map((fh) => (
              <div key={fh._id} className="p-3 bg-gray-50 rounded-lg text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{fh.fromDepartment?.name || 'Initial'}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium">{fh.toDepartment?.name}</span>
                </div>
                <p className="text-gray-700">{fh.reason}</p>
                {fh.expectedAction && <p className="text-gray-500 text-xs">Expected: {fh.expectedAction}</p>}
                <p className="text-xs text-gray-500 mt-1">By: {fh.forwardedBy?.firstName} {fh.forwardedBy?.lastName} • {new Date(fh.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'corrections' && (
          <div className="space-y-3">
            {correctionRequests.length === 0 ? <p className="text-gray-500 text-center py-4">No correction requests</p> : correctionRequests.map((cr) => (
              <div key={cr._id} className="p-3 bg-gray-50 rounded-lg text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{cr.fieldToCorrect}</span>
                  <StatusBadge status={cr.status} />
                </div>
                <p className="text-gray-700"><span className="line-through text-red-500">{cr.oldValue}</span> → <span className="text-green-600">{cr.requestedNewValue}</span></p>
                <p className="text-gray-500 text-xs">Reason: {cr.reason}</p>
                <p className="text-xs text-gray-500 mt-1">By: {cr.requestedBy?.firstName} {cr.requestedBy?.lastName} • {new Date(cr.createdAt).toLocaleString()}</p>
                {cr.reviewedBy && <p className="text-xs text-gray-500">Reviewed by: {cr.reviewedBy?.firstName} {cr.reviewedBy?.lastName} {cr.reviewRemarks && `- ${cr.reviewRemarks}`}</p>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-3">
            {payments.length === 0 ? <p className="text-gray-500 text-center py-4">No payments</p> : payments.map((pay) => (
              <div key={pay._id} className="p-3 bg-gray-50 rounded-lg text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">₹{pay.amount.toLocaleString()}</span>
                  <StatusBadge status={pay.status} />
                </div>
                <p className="text-gray-700 capitalize">Mode: {(pay.paymentMode || '').replace(/_/g, ' ')} {pay.transactionId && `• TxID: ${pay.transactionId}`}</p>
                <p className="text-gray-500 text-xs">Receipt: {pay.receiptNumber}</p>
                <p className="text-xs text-gray-500 mt-1">By: {pay.recordedBy?.firstName} {pay.recordedBy?.lastName} • {new Date(pay.createdAt).toLocaleString()}</p>
                {pay.isCancelled && <p className="text-xs text-red-500">Cancelled: {pay.cancelReason}</p>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-3">
            {checklist.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Document Checklist</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {checklist.map((doc) => (
                    <div key={doc._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                      <span className={`w-3 h-3 rounded-full ${doc.isVerified ? 'bg-green-500' : doc.isReceived ? 'bg-yellow-500' : 'bg-gray-300'}`} />
                      <span className="capitalize">{doc.documentType.replace(/_/g, ' ')}</span>
                      {doc.isRequired && <span className="text-xs text-red-500">*</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {documents.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 mt-4">Uploaded Documents</h4>
                {documents.map((doc) => (
                  <div key={doc._id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm mb-1">
                    <span>{doc.originalName}</span>
                    <a href={doc.filePath} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-xs">Download</a>
                  </div>
                ))}
              </div>
            )}
            {checklist.length === 0 && documents.length === 0 && <p className="text-gray-500 text-center py-4">No documents</p>}
          </div>
        )}

        {activeTab === 'receipts' && (
          <div className="space-y-2">
            {receipts.length === 0 ? <p className="text-gray-500 text-center py-4">No receipts generated</p> : receipts.map((r) => (
              <div key={r._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                <div>
                  <span className="font-medium capitalize">{r.receiptType.replace(/_/g, ' ')}</span>
                  <span className="text-gray-500 ml-2">#{r.receiptNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</span>
                  <a href={r.filePath} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-xs">Download</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showForwardModal} onClose={() => setShowForwardModal(false)} title="Forward Case" size="lg">
        <form onSubmit={handleForward} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
            <select value={forwardForm.toDepartment} onChange={(e) => setForwardForm({ ...forwardForm, toDepartment: e.target.value })} className="select-field" required>
              <option value="">Select Department</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To (Optional)</label>
            <select value={forwardForm.toUser} onChange={(e) => setForwardForm({ ...forwardForm, toUser: e.target.value })} className="select-field">
              <option value="">Auto-assign</option>
              {users.map((u) => <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.role?.name})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
            <textarea value={forwardForm.reason} onChange={(e) => setForwardForm({ ...forwardForm, reason: e.target.value })} className="input-field" rows="3" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={forwardForm.priority} onChange={(e) => setForwardForm({ ...forwardForm, priority: e.target.value })} className="select-field">
                {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" value={forwardForm.dueDate} onChange={(e) => setForwardForm({ ...forwardForm, dueDate: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Action</label>
            <input type="text" value={forwardForm.expectedAction} onChange={(e) => setForwardForm({ ...forwardForm, expectedAction: e.target.value })} className="input-field" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForwardModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Forward</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} title="Add Note">
        <form onSubmit={handleAddNote} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note Type</label>
            <select value={noteForm.noteType} onChange={(e) => setNoteForm({ ...noteForm, noteType: e.target.value })} className="select-field">
              {['internal', 'visible', 'follow_up', 'correction', 'management', 'department', 'accounts', 'registrar', 'counselling', 'reception'].map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note Text *</label>
            <textarea value={noteForm.text} onChange={(e) => setNoteForm({ ...noteForm, text: e.target.value })} className="input-field" rows="4" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
            <input type="date" value={noteForm.followUpDate} onChange={(e) => setNoteForm({ ...noteForm, followUpDate: e.target.value })} className="input-field" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowNoteModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Add Note</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showCorrectionModal} onClose={() => setShowCorrectionModal(false)} title="Request Correction">
        <form onSubmit={handleCorrectionRequest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field to Correct *</label>
            <input type="text" value={correctionForm.fieldToCorrect} onChange={(e) => setCorrectionForm({ ...correctionForm, fieldToCorrect: e.target.value })} className="input-field" placeholder="e.g., visitorName, mobile" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Old Value *</label>
            <input type="text" value={correctionForm.oldValue} onChange={(e) => setCorrectionForm({ ...correctionForm, oldValue: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Value *</label>
            <input type="text" value={correctionForm.requestedNewValue} onChange={(e) => setCorrectionForm({ ...correctionForm, requestedNewValue: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
            <textarea value={correctionForm.reason} onChange={(e) => setCorrectionForm({ ...correctionForm, reason: e.target.value })} className="input-field" rows="3" required />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowCorrectionModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Submit Request</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
