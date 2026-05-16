import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';

const PURPOSE_OPTIONS = [
  'admission_enquiry', 'course_information', 'fee_enquiry', 'document_submission',
  'document_collection', 'registrar_work', 'practical_examiner_visit', 'external_teacher_visit',
  'guest_faculty_visit', 'workshop_seminar_visit', 'placement_company_visit', 'vendor_supplier_visit',
  'parent_meeting', 'student_complaint', 'parent_complaint', 'scholarship_enquiry',
  'hostel_enquiry', 'transport_enquiry', 'library_lab_work', 'exam_practical_work',
  'certificate_degree_work', 'alumni_visit', 'government_official_visit', 'general_enquiry', 'custom',
];

export default function CasesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cases, setCases] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: '',
    purposeCategory: '',
    priority: '',
    startDate: '',
    endDate: '',
  });

  const fetchCases = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      Object.entries(filters).forEach(([key, value]) => { if (value) params[key] = value; });
      const { data } = await api.get('/cases', { params });
      setCases(data.cases);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCases(); }, [page, filters]);

  const columns = [
    { key: 'caseId', label: 'Case ID', render: (row) => (
      <button onClick={() => navigate(`/cases/${row._id}`)} className="text-indigo-600 hover:underline font-medium">{row.caseId}</button>
    )},
    { key: 'visitorName', label: 'Visitor Name' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'purposeCategory', label: 'Purpose', render: (row) => (
      <span className="capitalize text-xs">{(row.purposeCategory || '').replace(/_/g, ' ')}</span>
    )},
    { key: 'priority', label: 'Priority', render: (row) => (
      <StatusBadge status={row.priority} />
    )},
    { key: 'currentStatus', label: 'Status', render: (row) => (
      <StatusBadge status={row.currentStatus} />
    )},
    { key: 'currentDepartment', label: 'Department', render: (row) => row.currentDepartment?.name || '-' },
    { key: 'currentAssignedUser', label: 'Assigned To', render: (row) => row.currentAssignedUser ? `${row.currentAssignedUser.firstName} ${row.currentAssignedUser.lastName}` : '-' },
    { key: 'createdAt', label: 'Created', render: (row) => new Date(row.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cases</h1>
          <p className="text-gray-500 mt-1">{total} total cases</p>
        </div>
        <button onClick={() => navigate('/reception/new')} className="btn-primary">+ New Entry</button>
      </div>

      <div className="card mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <input type="text" placeholder="Search..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="input-field" />
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="select-field">
            <option value="">All Statuses</option>
            {['new', 'forwarded', 'in_progress', 'closed', 'admitted', 'fee_pending', 'document_verification'].map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select value={filters.purposeCategory} onChange={(e) => setFilters({ ...filters, purposeCategory: e.target.value })} className="select-field">
            <option value="">All Purposes</option>
            {PURPOSE_OPTIONS.map(p => (
              <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} className="select-field">
            <option value="">All Priorities</option>
            {['low', 'medium', 'high', 'urgent'].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="input-field" />
          <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="input-field" />
        </div>
      </div>

      <DataTable columns={columns} data={cases} page={page} totalPages={totalPages} onPageChange={setPage} loading={loading} emptyMessage="No cases found" />
    </div>
  );
}
