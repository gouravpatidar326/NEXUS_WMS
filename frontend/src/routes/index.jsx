import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/guards/ProtectedRoute';
import PermissionGuard from '@/guards/PermissionGuard';
import AppLayout from '@/layouts/AppLayout';
import AuthLayout from '@/layouts/AuthLayout';
import LoadingState from '@/components/feedback/LoadingState';

import {
  LoginPage,
  ForgotPasswordPage,
  AccessDeniedPage,
  PROTECTED_ROUTES,
} from './routeConfig';

export const AppRouter = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
          <LoadingState message="Loading module..." />
        </div>
      }
    >
      <Routes>
        {/* Auth Layout Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route index element={<Navigate to="login" replace />} />
        </Route>

        {/* Access Denied Route */}
        <Route path="/access-denied" element={<AccessDeniedPage />} />

        {/* Main App Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          {PROTECTED_ROUTES.map(({ path, Component, permission }) => (
            <Route
              key={path}
              path={path}
              element={
                <PermissionGuard
                  permission={permission}
                  fallback={<Navigate to="/access-denied" replace />}
                >
                  <Component />
                </PermissionGuard>
              }
            />
          ))}
        </Route>

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
