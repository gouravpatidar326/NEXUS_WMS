import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/permissions/permissionUtils';

export const PermissionGuard = ({
  permission,
  anyPermission,
  allPermissions,
  fallback = null,
  children,
}) => {
  const { user } = useAuth();

  if (!user) return fallback;

  let isAllowed = false;

  if (permission) {
    isAllowed = hasPermission(user, permission);
  } else if (anyPermission) {
    isAllowed = hasAnyPermission(user, anyPermission);
  } else if (allPermissions) {
    isAllowed = hasAllPermissions(user, allPermissions);
  } else {
    isAllowed = true;
  }

  if (!isAllowed) {
    return fallback;
  }

  return children;
};

export default PermissionGuard;
