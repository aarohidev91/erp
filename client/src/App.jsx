import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import DashboardPage from './pages/DashboardPage';
import CasesPage from './pages/CasesPage';
import CaseDetailPage from './pages/CaseDetailPage';
import NewVisitorPage from './pages/reception/NewVisitorPage';
import TodayVisitorsPage from './pages/reception/TodayVisitorsPage';
import MyCasesPage from './pages/reception/MyCasesPage';
import AssignedEnquiriesPage from './pages/counsellor/AssignedEnquiriesPage';
import FollowUpsPage from './pages/counsellor/FollowUpsPage';
import DepartmentCasesPage from './pages/department/DepartmentCasesPage';
import AccountsCasesPage from './pages/accounts/AccountsCasesPage';
import PaymentsPage from './pages/accounts/PaymentsPage';
import RegistrarCasesPage from './pages/registrar/RegistrarCasesPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import RoleManagementPage from './pages/admin/RoleManagementPage';
import DepartmentManagementPage from './pages/admin/DepartmentManagementPage';
import CourseManagementPage from './pages/admin/CourseManagementPage';
import CorrectionsPage from './pages/CorrectionsPage';
import ReportsPage from './pages/ReportsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword) return <Navigate to="/change-password" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>;
  if (user && !user.mustChangePassword) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="cases" element={<CasesPage />} />
              <Route path="cases/:id" element={<CaseDetailPage />} />
              <Route path="reception/new" element={<NewVisitorPage />} />
              <Route path="reception/today" element={<TodayVisitorsPage />} />
              <Route path="reception/my-cases" element={<MyCasesPage />} />
              <Route path="counsellor/assigned" element={<AssignedEnquiriesPage />} />
              <Route path="counsellor/follow-ups" element={<FollowUpsPage />} />
              <Route path="department/cases" element={<DepartmentCasesPage />} />
              <Route path="accounts/cases" element={<AccountsCasesPage />} />
              <Route path="accounts/payments" element={<PaymentsPage />} />
              <Route path="registrar/cases" element={<RegistrarCasesPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="roles" element={<RoleManagementPage />} />
              <Route path="departments" element={<DepartmentManagementPage />} />
              <Route path="courses" element={<CourseManagementPage />} />
              <Route path="corrections" element={<CorrectionsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
