import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/permissions/roles';

export const AccessDeniedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-5 rounded-3xl bg-danger-100 dark:bg-danger-900/30 text-danger-600 mb-6 shadow-xl animate-pulse">
        <ShieldAlert className="h-16 w-16" />
      </div>

      <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
        403 — Access Denied
      </h1>

      <p className="text-sm text-surface-600 dark:text-surface-400 max-w-md mt-2 mb-2">
        You do not have the required RBAC permissions to access this page or resource.
      </p>

      {user && (
        <div className="px-4 py-2 bg-surface-100 dark:bg-surface-800 rounded-xl text-xs text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700 mb-6">
          Your current role is <strong className="text-primary-600 dark:text-primary-400">{ROLE_LABELS[user.role]}</strong>.
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          leftIcon={ArrowLeft}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <Button
          variant="primary"
          leftIcon={Home}
          onClick={() => navigate('/dashboard')}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
