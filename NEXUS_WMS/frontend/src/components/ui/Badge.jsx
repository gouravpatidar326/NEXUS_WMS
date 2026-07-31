import clsx from 'clsx';

const VARIANTS = {
  primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300 border-primary-200 dark:border-primary-800',
  success: 'bg-success-100 text-success-800 dark:bg-success-900/40 dark:text-success-300 border-success-200 dark:border-success-800',
  warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/40 dark:text-warning-300 border-warning-200 dark:border-warning-800',
  danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900/40 dark:text-danger-300 border-danger-200 dark:border-danger-800',
  info: 'bg-info-100 text-info-800 dark:bg-info-900/40 dark:text-info-300 border-info-200 dark:border-info-800',
  neutral: 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300 border-surface-200 dark:border-surface-700',
};

export const Badge = ({ variant = 'neutral', children, className, dot = false }) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border',
        VARIANTS[variant] || VARIANTS.neutral,
        className
      )}
    >
      {dot && (
        <span
          className={clsx(
            'h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-success-500',
            variant === 'warning' && 'bg-warning-500',
            variant === 'danger' && 'bg-danger-500',
            variant === 'info' && 'bg-info-500',
            variant === 'primary' && 'bg-primary-500',
            variant === 'neutral' && 'bg-surface-400'
          )}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
