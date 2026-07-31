import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const Timeline = ({ items = [] }) => {
  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-200 dark:before:bg-surface-800">
      {items.map((item, idx) => {
        const Icon =
          item.status === 'completed'
            ? CheckCircle2
            : item.status === 'pending'
            ? Clock
            : AlertCircle;

        const statusColor =
          item.status === 'completed'
            ? 'text-success-600 bg-success-100 dark:bg-success-900/30'
            : item.status === 'pending'
            ? 'text-warning-600 bg-warning-100 dark:bg-warning-900/30'
            : 'text-danger-600 bg-danger-100 dark:bg-danger-900/30';

        return (
          <div key={item.id || idx} className="relative group">
            <div
              className={`absolute -left-[29px] top-0.5 p-1 rounded-full ${statusColor} ring-4 ring-white dark:ring-surface-900`}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                  {item.title}
                </span>
                <span className="text-xs text-surface-400">{item.timestamp}</span>
              </div>
              <p className="text-xs text-surface-600 dark:text-surface-400">
                {item.description}
              </p>
              {item.user && (
                <span className="inline-block text-[11px] font-medium text-surface-400">
                  By {item.user}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
