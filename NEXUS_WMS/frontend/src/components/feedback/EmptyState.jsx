import { FolderOpen } from 'lucide-react';
import Button from '@/components/ui/Button';

export const EmptyState = ({
  title = 'No records found',
  description = 'Try adjusting your search or filter parameters to find what you are looking for.',
  actionLabel,
  onAction,
  icon: Icon = FolderOpen,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="p-4 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-400 mb-4">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold text-surface-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm text-surface-500 dark:text-surface-400 max-w-sm mt-1 mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
};

export default EmptyState;
