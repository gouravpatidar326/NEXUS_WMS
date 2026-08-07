import { forwardRef } from 'react';
import clsx from 'clsx';

export const Select = forwardRef(
  ({ options = [], placeholder = null, error, className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={clsx(
          'w-full py-2 px-3 text-sm bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 rounded-lg border transition duration-150 focus:outline-none focus:ring-2',
          error
            ? 'border-danger-500 focus:ring-danger-500'
            : 'border-surface-300 dark:border-surface-700 focus:ring-primary-500',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => {
          const value = typeof opt === 'object' ? opt.value : opt;
          const label = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    );
  }
);

Select.displayName = 'Select';
export default Select;
