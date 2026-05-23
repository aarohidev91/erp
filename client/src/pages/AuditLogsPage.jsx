import { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/common/DataTable';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 30 };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const { data } = await api.get('/reports/audit-logs', { params });
      setLogs(data.logs || []); setTotal(data.total); setTotalPages(data.totalPages);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, [page, startDate, endDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const columns = [
    { key: 'action', label: 'Action' },
    { key: 'entity', label: 'Entity' },
    { key: 'entityId', label: 'Entity ID', render: (r) => <span className="text-xs font-mono">{r.entityId?.substring(0, 12)}</span> },
    { key: 'performedBy', label: 'By', render: (r) => `${r.performedBy?.firstName || ''} ${r.performedBy?.lastName || ''}` },
    { key: 'createdAt', label: 'Time', render: (r) => new Date(r.createdAt).toLocaleString() },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-gray-500 mt-1">{total} logs</p>
        </div>
        <div className="flex gap-3">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
        </div>
      </div>
      <DataTable columns={columns} data={logs} page={page} totalPages={totalPages} onPageChange={setPage} loading={loading} emptyMessage="No audit logs" />
    </div>
  );
}
