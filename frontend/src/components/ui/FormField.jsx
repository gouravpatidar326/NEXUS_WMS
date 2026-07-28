import clsx from 'clsx';

export const FormField = ({ label, error, required, hint, children, className }) => {
  return (
    <div className={clsx('space-y-1.5', className)}>
      {label && (
        <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wider">
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-surface-500 dark:text-surface-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-danger-600 dark:text-danger-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
