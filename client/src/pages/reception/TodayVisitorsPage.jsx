import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';

export default function TodayVisitorsPage() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cases/today').then(({ data }) => { setCases(data.cases || []); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'caseId', label: 'Case ID', render: (r) => <button onClick={() => navigate(`/cases/${r._id}`)} className="text-indigo-600 hover:underline font-medium">{r.caseId}</button> },
    { key: 'visitorName', label: 'Visitor' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'purposeCategory', label: 'Purpose', render: (r) => <span className="capitalize text-xs">{(r.purposeCategory || '').replace(/_/g, ' ')}</span> },
    { key: 'currentStatus', label: 'Status', render: (r) => <StatusBadge status={r.currentStatus} /> },
    { key: 'entryTime', label: 'Entry', render: (r) => new Date(r.entryTime).toLocaleTimeString() },
    { key: 'exitTime', label: 'Exit', render: (r) => r.exitTime ? new Date(r.exitTime).toLocaleTimeString() : '-' },
    { key: 'createdBy', label: 'Created By', render: (r) => `${r.createdBy?.firstName || ''} ${r.createdBy?.lastName || ''}` },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Today's Visitors</h1>
          <p className="text-gray-500 mt-1">{cases.length} visitors today</p>
        </div>
        <button onClick={() => navigate('/reception/new')} className="btn-primary">+ New Entry</button>
      </div>
      <DataTable columns={columns} data={cases} page={1} totalPages={1} onPageChange={() => {}} loading={loading} emptyMessage="No visitors today" />
    </div>
  );
}
