import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = 'Loading data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Loader2 className="h-8 w-8 text-primary-600 animate-spin mb-3" />
      <p className="text-sm font-medium text-surface-600 dark:text-surface-300">
        {message}
      </p>
    </div>
  );
};

export default LoadingState;
