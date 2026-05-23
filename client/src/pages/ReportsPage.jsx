import { useState, useEffect } from 'react';
import api from '../services/api';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('receptionist');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const { data: result } = await api.get(`/reports/${reportType}`, { params });
      setData(result);
    } catch { setData(null); } finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, [reportType, startDate, endDate]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <div className="card mb-6">
        <div className="flex flex-wrap gap-3">
          <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="select-field max-w-xs">
            <option value="receptionist">Receptionist Report</option>
            <option value="counsellor">Counsellor Report</option>
            <option value="fee">Fee Collection Report</option>
            <option value="staff-performance">Staff Performance</option>
            <option value="login-logs">Login Logs</option>
            <option value="audit-logs">Audit Logs</option>
          </select>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field max-w-xs" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field max-w-xs" />
          <button onClick={fetchReport} className="btn-primary">Generate</button>
        </div>
      </div>
      {loading && <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>}
      {data && !loading && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 capitalize">{reportType.replace(/-/g, ' ')} Report</h3>
          {reportType === 'receptionist' && data.report && (
            <div className="space-y-3">
              {data.report.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{r.user?.firstName} {r.user?.lastName}</p>
                    <p className="text-sm text-gray-500">{r.user?.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{r.totalCases}</p>
                    <p className="text-xs text-gray-500">cases</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {reportType === 'counsellor' && data.report && (
            <div className="space-y-3">
              {data.report.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{r.user?.firstName} {r.user?.lastName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{r.totalAssigned} assigned • {r.converted} converted</p>
                    <p className="text-xs text-gray-500">Hot: {r.hotLeads} • Warm: {r.warmLeads}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {reportType === 'fee' && data.report && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg"><p className="text-2xl font-bold text-green-700">₹{(data.report.totalCollected || 0).toLocaleString()}</p><p className="text-sm text-gray-500">Total Collected</p></div>
                <div className="text-center p-4 bg-blue-50 rounded-lg"><p className="text-2xl font-bold text-blue-700">{data.report.totalPayments || 0}</p><p className="text-sm text-gray-500">Payments</p></div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg"><p className="text-2xl font-bold text-yellow-700">{data.report.pendingPayments || 0}</p><p className="text-sm text-gray-500">Pending</p></div>
              </div>
            </div>
          )}
          {reportType === 'staff-performance' && data.performance && (
            <div className="space-y-3">
              {data.performance.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{p.user?.firstName} {p.user?.lastName}</p>
                    <p className="text-sm text-gray-500">{p.user?.role?.name}</p>
                  </div>
                  <p className="font-bold">{p.totalActions} actions</p>
                </div>
              ))}
            </div>
          )}
          {(reportType === 'audit-logs' || reportType === 'login-logs') && (data.logs || data.auditLogs) && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {(data.logs || data.auditLogs || []).map((log, i) => (
                <div key={i} className="p-2 bg-gray-50 rounded text-sm">
                  <span className="font-medium">{log.action}</span>
                  <span className="text-gray-500 ml-2">{log.performedBy?.firstName || log.user?.firstName} {log.performedBy?.lastName || log.user?.lastName}</span>
                  <span className="text-gray-400 ml-2">{new Date(log.createdAt).toLocaleString()}</span>
                  {log.entity && <span className="text-gray-400 ml-2">[{log.entity}]</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
