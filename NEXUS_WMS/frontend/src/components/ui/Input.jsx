import { forwardRef } from 'react';
import clsx from 'clsx';

export const Input = forwardRef(
  (
    {
      type = 'text',
      error,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative w-full">
        {LeftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
            <LeftIcon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={clsx(
            'w-full py-2 text-sm bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 rounded-lg border transition duration-150 focus:outline-none focus:ring-2',
            LeftIcon ? 'pl-9' : 'pl-3',
            RightIcon ? 'pr-9' : 'pr-3',
            error
              ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500'
              : 'border-surface-300 dark:border-surface-700 focus:ring-primary-500 focus:border-primary-500',
            className
          )}
          {...props}
        />
        {RightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
            <RightIcon className="h-4 w-4" />
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
