import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RoleRoute({ roles, permissions, children }) {
  const { user, isRole, hasPermission } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !isRole(...roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (permissions && !permissions.some(p => hasPermission(p))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
