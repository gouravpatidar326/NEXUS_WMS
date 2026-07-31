import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasRole, hasMinimumRole } from '@/permissions/permissionUtils';

export const RoleGuard = ({ allowedRoles, minimumRole, children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  let isAllowed = false;

  if (allowedRoles && Array.isArray(allowedRoles)) {
    isAllowed = allowedRoles.some((role) => hasRole(user, role));
  } else if (minimumRole) {
    isAllowed = hasMinimumRole(user, minimumRole);
  }

  if (!isAllowed) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default RoleGuard;
