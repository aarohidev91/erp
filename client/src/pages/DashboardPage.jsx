import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  HiUsers, HiClipboardList, HiCurrencyRupee, HiExclamation,
  HiTrendingUp, HiClock, HiCheckCircle, HiXCircle,
} from 'react-icons/hi';

function StatCard({ icon: Icon, label, value, color, onClick }) {
  return (
    <div onClick={onClick} className={`card cursor-pointer hover:shadow-md transition-shadow ${onClick ? '' : 'cursor-default'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isRole } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const s = stats || {};

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.firstName}. Here is your overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={HiUsers} label="Visitors Today" value={s.totalVisitorsToday || 0} color="bg-blue-500" onClick={() => navigate('/reception/today')} />
        <StatCard icon={HiClipboardList} label="Total Cases" value={s.totalCases || 0} color="bg-indigo-500" onClick={() => navigate('/cases')} />
        <StatCard icon={HiClock} label="Pending Cases" value={s.pendingCases || 0} color="bg-yellow-500" onClick={() => navigate('/cases?status=pending')} />
        <StatCard icon={HiCurrencyRupee} label="Fee Collection Today" value={`₹${(s.feeCollectionToday || 0).toLocaleString()}`} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={HiTrendingUp} label="Admission Enquiries" value={s.admissionEnquiries || 0} color="bg-purple-500" />
        <StatCard icon={HiCheckCircle} label="Hot Leads" value={s.hotLeads || 0} color="bg-red-500" />
        <StatCard icon={HiExclamation} label="Pending Corrections" value={s.pendingCorrections || 0} color="bg-orange-500" onClick={() => navigate('/corrections')} />
        <StatCard icon={HiXCircle} label="Payments Today" value={s.todayPayments || 0} color="bg-teal-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Cases by Purpose</h3>
          <div className="space-y-2">
            {(s.purposeBreakdown || []).slice(0, 10).map((item) => (
              <div key={item._id} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-600 capitalize">{(item._id || '').replace(/_/g, ' ')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min((item.count / (s.totalCases || 1)) * 100, 100)}%` }} />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Cases by Status</h3>
          <div className="space-y-2">
            {(s.statusBreakdown || []).slice(0, 10).map((item) => (
              <div key={item._id} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-600 capitalize">{(item._id || '').replace(/_/g, ' ')}</span>
                <span className="text-sm font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(s.recentLogins || []).length > 0 && isRole('super_admin', 'admin') && (
        <div className="card mt-6">
          <h3 className="text-lg font-semibold mb-4">Recent Logins</h3>
          <div className="space-y-2">
            {s.recentLogins.map((log, i) => (
              <div key={i} className="flex items-center justify-between py-1 text-sm">
                <span className="text-gray-900">{log.user?.firstName} {log.user?.lastName} ({log.user?.username})</span>
                <span className="text-gray-500">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
