import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import toast from 'react-hot-toast';

export default function CorrectionsPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [corrections, setCorrections] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (status) params.status = status;
      const { data } = await api.get('/correction-requests', { params });
      setCorrections(data.correctionRequests || []); setTotal(data.total); setTotalPages(data.totalPages);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [page, status]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReview = async (id, action) => {
    const reviewRemarks = prompt(`Remarks for ${action}:`);
    if (reviewRemarks === null) return;
    try {
      await api.put(`/correction-requests/${id}/review`, { status: action, reviewRemarks });
      toast.success(`Correction ${action}`);
      fetch();
    } catch { toast.error('Failed'); }
  };

  const columns = [
    { key: 'case', label: 'Case', render: (r) => <button onClick={() => navigate(`/cases/${r.case?._id || r.case}`)} className="text-indigo-600 hover:underline text-sm">{r.case?.caseId || 'View'}</button> },
    { key: 'fieldToCorrect', label: 'Field' },
    { key: 'oldValue', label: 'Old Value' },
    { key: 'requestedNewValue', label: 'New Value' },
    { key: 'reason', label: 'Reason', render: (r) => <span className="text-xs">{r.reason?.substring(0, 50)}</span> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'requestedBy', label: 'By', render: (r) => `${r.requestedBy?.firstName || ''} ${r.requestedBy?.lastName || ''}` },
    { key: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleDateString() },
    ...(hasPermission('approve_correction') ? [
      { key: 'actions', label: 'Actions', render: (r) => r.status === 'pending' ? (
        <div className="flex gap-1">
          <button onClick={() => handleReview(r._id, 'approved')} className="text-green-600 hover:underline text-xs">Approve</button>
          <button onClick={() => handleReview(r._id, 'rejected')} className="text-red-600 hover:underline text-xs">Reject</button>
        </div>
      ) : '-' },
    ] : []),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Correction Requests</h1>
          <p className="text-gray-500 mt-1">{total} requests</p>
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="select-field max-w-xs">
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <DataTable columns={columns} data={corrections} page={page} totalPages={totalPages} onPageChange={setPage} loading={loading} emptyMessage="No correction requests" />
    </div>
  );
}
