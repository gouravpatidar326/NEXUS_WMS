import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ROLES } from '@/permissions/roles';
import { getUserPermissions } from '@/permissions/permissionUtils';
import { ROLE_PERMISSIONS } from '@/permissions/rolePermissions';
import { roleService } from '@/services/roleService';
import { api } from '@/services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync role permissions from real backend API
  const syncPermissionsFromApi = useCallback(async () => {
    try {
      const rolesData = await roleService.getRoles();
      if (Array.isArray(rolesData)) {
        rolesData.forEach((r) => {
          if (r.key && Array.isArray(r.permissions)) {
            ROLE_PERMISSIONS[r.key] = r.permissions;
          }
        });
      }
    } catch (err) {
      console.error('Failed to sync RBAC permissions from API:', err);
    }
  }, []);

  // Hydrate from localStorage on mount & sync live permissions
  useEffect(() => {
    const storedUser = localStorage.getItem('wms_user');
    const storedToken = localStorage.getItem('wms_token');
    if (storedUser && storedToken) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch {
        localStorage.removeItem('wms_user');
        localStorage.removeItem('wms_token');
      }
    }
    setIsLoading(false);

    syncPermissionsFromApi();

    // Listen for unauthorized events to force logout
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [syncPermissionsFromApi]);

  const login = useCallback(async (email, password) => {
    try {
      // Connect to real backend
      const response = await api.post('/auth/login', { email, password });
      
      const { user: backendUser, token } = response;
      
      setUser(backendUser);
      localStorage.setItem('wms_user', JSON.stringify(backendUser));
      localStorage.setItem('wms_token', token);
      
      await syncPermissionsFromApi();

      return { success: true, user: backendUser };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: error.message || 'Invalid credentials' };
    }
  }, [syncPermissionsFromApi]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('wms_user');
    localStorage.removeItem('wms_token');
  }, []);

  const updateProfile = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('wms_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const permissions = user ? getUserPermissions(user) : [];
  const isAuthenticated = !!user;

  const value = {
    user,
    permissions,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateProfile,
    syncPermissionsFromApi,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

export default AuthContext;
