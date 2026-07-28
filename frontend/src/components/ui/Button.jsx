import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

const VARIANTS = {
  primary:
    'bg-primary-600 hover:bg-primary-700 text-white shadow-sm focus:ring-primary-500',
  secondary:
    'bg-surface-100 hover:bg-surface-200 text-surface-800 dark:bg-surface-800 dark:hover:bg-surface-700 dark:text-surface-100 focus:ring-surface-400',
  outline:
    'border border-surface-300 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 focus:ring-primary-500',
  ghost:
    'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 focus:ring-surface-400',
  danger:
    'bg-danger-600 hover:bg-danger-700 text-white shadow-sm focus:ring-danger-500',
  success:
    'bg-success-600 hover:bg-success-700 text-white shadow-sm focus:ring-success-500',
};

const SIZES = {
  sm: 'px-2.5 py-1.5 text-xs font-medium rounded-md gap-1.5',
  md: 'px-3.5 py-2 text-sm font-medium rounded-lg gap-2',
  lg: 'px-4 py-2.5 text-base font-semibold rounded-xl gap-2.5',
};

export const Button = forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      children,
      className,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={clsx(
          'inline-flex max-w-full items-center justify-center whitespace-nowrap transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-surface-900 disabled:opacity-50 disabled:cursor-not-allowed',
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        ) : LeftIcon ? (
          <LeftIcon className="h-4 w-4 shrink-0" />
        ) : null}
        {children}
        {!isLoading && RightIcon && <RightIcon className="h-4 w-4 shrink-0" />}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
