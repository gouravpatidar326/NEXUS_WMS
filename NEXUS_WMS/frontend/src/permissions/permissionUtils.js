import { ROLE_PERMISSIONS } from './rolePermissions';
import { ROLE_HIERARCHY } from './roles';

/**
 * Check if a user has a specific permission
 * @param {Object} user - The current user object
 * @param {string} permission - The permission key to check
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
};

/**
 * Check if a user has all of the given permissions
 * @param {Object} user
 * @param {string[]} permissions
 * @returns {boolean}
 */
export const hasAllPermissions = (user, permissions) => {
  return permissions.every((p) => hasPermission(user, p));
};

/**
 * Check if a user has any of the given permissions
 * @param {Object} user
 * @param {string[]} permissions
 * @returns {boolean}
 */
export const hasAnyPermission = (user, permissions) => {
  return permissions.some((p) => hasPermission(user, p));
};

/**
 * Check if user has a specific role
 * @param {Object} user
 * @param {string} role
 * @returns {boolean}
 */
export const hasRole = (user, role) => {
  if (!user) return false;
  return user.role === role;
};

/**
 * Check if user has a role equal to or higher than the given role
 * @param {Object} user
 * @param {string} minimumRole
 * @returns {boolean}
 */
export const hasMinimumRole = (user, minimumRole) => {
  if (!user) return false;
  const userLevel = ROLE_HIERARCHY[user.role] || 0;
  const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;
  return userLevel >= requiredLevel;
};

/**
 * Get all permissions for a role
 * @param {string} role
 * @returns {string[]}
 */
export const getPermissionsForRole = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Get all permissions for the current user
 * @param {Object} user
 * @returns {string[]}
 */
export const getUserPermissions = (user) => {
  if (!user || !user.role) return [];
  return ROLE_PERMISSIONS[user.role] || [];
};
