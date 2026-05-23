import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  HiUsers, HiClipboardList, HiCurrencyRupee, HiExclamation,
  HiTrendingUp, HiClock, HiCheckCircle, HiXCircle,
  HiCalendar, HiCollection, HiUserGroup,
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

function AdminDashboard({ stats, navigate }) {
  const s = stats || {};
  return (
    <>
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
      {(s.recentLogins || []).length > 0 && (
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
    </>
  );
}

function ReceptionDashboard({ stats, navigate }) {
  const s = stats || {};
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={HiUsers} label="Visitors Today" value={s.totalVisitorsToday || 0} color="bg-blue-500" onClick={() => navigate('/reception/today')} />
        <StatCard icon={HiCollection} label="My Cases" value={s.totalCases || 0} color="bg-indigo-500" onClick={() => navigate('/reception/my-cases')} />
        <StatCard icon={HiClock} label="Pending Cases" value={s.pendingCases || 0} color="bg-yellow-500" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button onClick={() => navigate('/reception/new')} className="w-full text-left px-4 py-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors">
              <span className="font-medium text-indigo-700">+ Register New Visitor</span>
              <p className="text-sm text-indigo-500 mt-0.5">Create a new visitor entry case</p>
            </button>
            <button onClick={() => navigate('/reception/today')} className="w-full text-left px-4 py-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
              <span className="font-medium text-blue-700">View Today&apos;s Visitors</span>
              <p className="text-sm text-blue-500 mt-0.5">See all visitors who came today</p>
            </button>
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Cases by Purpose</h3>
          <div className="space-y-2">
            {(s.purposeBreakdown || []).slice(0, 8).map((item) => (
              <div key={item._id} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-600 capitalize">{(item._id || '').replace(/_/g, ' ')}</span>
                <span className="text-sm font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function CounsellorDashboard({ stats, navigate }) {
  const s = stats || {};
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={HiUserGroup} label="Assigned Enquiries" value={s.admissionEnquiries || 0} color="bg-purple-500" onClick={() => navigate('/counsellor/assigned')} />
        <StatCard icon={HiCheckCircle} label="Hot Leads" value={s.hotLeads || 0} color="bg-red-500" />
        <StatCard icon={HiCalendar} label="Follow-ups Due" value={s.pendingCases || 0} color="bg-orange-500" onClick={() => navigate('/counsellor/follow-ups')} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button onClick={() => navigate('/counsellor/assigned')} className="w-full text-left px-4 py-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
              <span className="font-medium text-purple-700">View Assigned Enquiries</span>
              <p className="text-sm text-purple-500 mt-0.5">Manage enquiries assigned to you</p>
            </button>
            <button onClick={() => navigate('/counsellor/follow-ups')} className="w-full text-left px-4 py-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
              <span className="font-medium text-orange-700">Pending Follow-ups</span>
              <p className="text-sm text-orange-500 mt-0.5">View follow-ups scheduled for today</p>
            </button>
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Cases by Status</h3>
          <div className="space-y-2">
            {(s.statusBreakdown || []).slice(0, 8).map((item) => (
              <div key={item._id} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-600 capitalize">{(item._id || '').replace(/_/g, ' ')}</span>
                <span className="text-sm font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function AccountsDashboard({ stats, navigate }) {
  const s = stats || {};
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={HiCurrencyRupee} label="Fee Collection Today" value={`₹${(s.feeCollectionToday || 0).toLocaleString()}`} color="bg-green-500" />
        <StatCard icon={HiXCircle} label="Payments Today" value={s.todayPayments || 0} color="bg-teal-500" onClick={() => navigate('/accounts/payments')} />
        <StatCard icon={HiClipboardList} label="Accounts Cases" value={s.totalCases || 0} color="bg-indigo-500" onClick={() => navigate('/accounts/cases')} />
      </div>
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={() => navigate('/accounts/cases')} className="w-full text-left px-4 py-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
            <span className="font-medium text-green-700">Accounts Cases</span>
            <p className="text-sm text-green-500 mt-0.5">View cases pending fee verification</p>
          </button>
          <button onClick={() => navigate('/accounts/payments')} className="w-full text-left px-4 py-3 rounded-lg bg-teal-50 hover:bg-teal-100 transition-colors">
            <span className="font-medium text-teal-700">Payment Records</span>
            <p className="text-sm text-teal-500 mt-0.5">View all payment transactions</p>
          </button>
        </div>
      </div>
    </>
  );
}

function DepartmentDashboard({ stats, navigate }) {
  const s = stats || {};
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={HiClipboardList} label="Department Cases" value={s.totalCases || 0} color="bg-indigo-500" onClick={() => navigate('/department/cases')} />
        <StatCard icon={HiClock} label="Pending" value={s.pendingCases || 0} color="bg-yellow-500" />
        <StatCard icon={HiUsers} label="Visitors Today" value={s.totalVisitorsToday || 0} color="bg-blue-500" />
      </div>
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button onClick={() => navigate('/department/cases')} className="w-full text-left px-4 py-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors">
            <span className="font-medium text-indigo-700">View Department Cases</span>
            <p className="text-sm text-indigo-500 mt-0.5">Cases assigned to your department</p>
          </button>
        </div>
      </div>
    </>
  );
}

function RegistrarDashboard({ stats, navigate }) {
  const s = stats || {};
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={HiClipboardList} label="Registrar Cases" value={s.totalCases || 0} color="bg-indigo-500" onClick={() => navigate('/registrar/cases')} />
        <StatCard icon={HiClock} label="Pending" value={s.pendingCases || 0} color="bg-yellow-500" />
        <StatCard icon={HiUsers} label="Visitors Today" value={s.totalVisitorsToday || 0} color="bg-blue-500" />
      </div>
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button onClick={() => navigate('/registrar/cases')} className="w-full text-left px-4 py-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors">
            <span className="font-medium text-indigo-700">View Registrar Cases</span>
            <p className="text-sm text-indigo-500 mt-0.5">Cases pending registration/verification</p>
          </button>
        </div>
      </div>
    </>
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

  const renderDashboard = () => {
    if (isRole('super_admin', 'admin')) {
      return <AdminDashboard stats={stats} navigate={navigate} />;
    }
    if (isRole('receptionist', 'senior_receptionist')) {
      return <ReceptionDashboard stats={stats} navigate={navigate} />;
    }
    if (isRole('counsellor', 'counselling_head')) {
      return <CounsellorDashboard stats={stats} navigate={navigate} />;
    }
    if (isRole('accounts_staff', 'accounts_head')) {
      return <AccountsDashboard stats={stats} navigate={navigate} />;
    }
    if (isRole('department_staff', 'hod')) {
      return <DepartmentDashboard stats={stats} navigate={navigate} />;
    }
    if (isRole('registrar', 'registrar_staff')) {
      return <RegistrarDashboard stats={stats} navigate={navigate} />;
    }
    // Default: show basic stats for other roles (auditor, principal, etc.)
    const s = stats || {};
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={HiClipboardList} label="Total Cases" value={s.totalCases || 0} color="bg-indigo-500" onClick={() => navigate('/cases')} />
        <StatCard icon={HiClock} label="Pending Cases" value={s.pendingCases || 0} color="bg-yellow-500" />
        <StatCard icon={HiUsers} label="Visitors Today" value={s.totalVisitorsToday || 0} color="bg-blue-500" />
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.firstName}. Here is your overview.</p>
      </div>
      {renderDashboard()}
    </div>
  );
}
