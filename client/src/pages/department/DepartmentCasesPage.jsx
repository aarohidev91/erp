import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';

export default function DepartmentCasesPage() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cases/department', { params: { page, limit: 20 } })
      .then(({ data }) => { setCases(data.cases || []); setTotal(data.total); setTotalPages(data.totalPages); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [page]);

  const columns = [
    { key: 'caseId', label: 'Case ID', render: (r) => <button onClick={() => navigate(`/cases/${r._id}`)} className="text-indigo-600 hover:underline font-medium">{r.caseId}</button> },
    { key: 'visitorName', label: 'Visitor' },
    { key: 'purposeCategory', label: 'Purpose', render: (r) => <span className="capitalize text-xs">{(r.purposeCategory || '').replace(/_/g, ' ')}</span> },
    { key: 'currentStatus', label: 'Status', render: (r) => <StatusBadge status={r.currentStatus} /> },
    { key: 'currentAssignedUser', label: 'Assigned To', render: (r) => r.currentAssignedUser ? `${r.currentAssignedUser.firstName} ${r.currentAssignedUser.lastName}` : '-' },
    { key: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Department Cases</h1>
        <p className="text-gray-500 mt-1">{total} cases in your department</p>
      </div>
      <DataTable columns={columns} data={cases} page={page} totalPages={totalPages} onPageChange={setPage} loading={loading} emptyMessage="No cases in your department" />
    </div>
  );
}
