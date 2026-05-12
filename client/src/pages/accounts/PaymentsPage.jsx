import { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const { data } = await api.get('/accounts/payments', { params });
      setPayments(data.payments || []); setTotal(data.total); setTotalPages(data.totalPages); setTotalAmount(data.totalAmount || 0);
    } catch (_e) {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [page, startDate, endDate]);

  const columns = [
    { key: 'receiptNumber', label: 'Receipt #' },
    { key: 'case', label: 'Case', render: (r) => r.case?.caseId || '-' },
    { key: 'amount', label: 'Amount', render: (r) => `₹${r.amount?.toLocaleString()}` },
    { key: 'paymentMode', label: 'Mode', render: (r) => <span className="capitalize">{(r.paymentMode || '').replace(/_/g, ' ')}</span> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'recordedBy', label: 'By', render: (r) => `${r.recordedBy?.firstName || ''} ${r.recordedBy?.lastName || ''}` },
    { key: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-gray-500 mt-1">{total} payments • Total: ₹{totalAmount.toLocaleString()}</p>
        </div>
      </div>
      <div className="card mb-4">
        <div className="flex gap-3">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field max-w-xs" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field max-w-xs" />
        </div>
      </div>
      <DataTable columns={columns} data={payments} page={page} totalPages={totalPages} onPageChange={setPage} loading={loading} emptyMessage="No payments found" />
    </div>
  );
}
