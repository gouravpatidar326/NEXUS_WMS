import { AlertOctagon, RotateCcw } from 'lucide-react';
import Button from '@/components/ui/Button';

export const ErrorState = ({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while fetching system data.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="p-4 rounded-full bg-danger-100 dark:bg-danger-900/30 text-danger-600 mb-4">
        <AlertOctagon className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold text-surface-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm text-surface-500 dark:text-surface-400 max-w-sm mt-1 mb-6">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" leftIcon={RotateCcw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
