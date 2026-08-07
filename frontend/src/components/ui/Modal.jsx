import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import clsx from 'clsx';

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl',
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeOnBackdropClick = false,
  closeOnEscape = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (closeOnEscape && e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={closeOnBackdropClick ? onClose : undefined}
      />

      <div className="flex min-h-full items-end justify-center sm:items-center sm:p-4">
        <div
          className={clsx(
            'relative flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-surface-200 bg-white shadow-2xl transition-all transform animate-slide-up dark:border-surface-800 dark:bg-surface-900 sm:max-h-[92vh] sm:rounded-2xl',
            SIZES[size]
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-surface-200 px-4 py-3 dark:border-surface-800 sm:px-6 sm:py-4">
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-200 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex flex-col-reverse gap-2 border-t border-surface-200 bg-surface-50 px-4 py-3 dark:border-surface-800 dark:bg-surface-800/40 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6 sm:py-4 [&>button]:w-full sm:[&>button]:w-auto">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
