import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Drawer = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-surface-900 shadow-2xl border-l border-surface-200 dark:border-surface-800 flex flex-col animate-slide-in-right">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-surface-200 px-4 py-4 dark:border-surface-800 sm:px-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex flex-col-reverse gap-2 border-t border-surface-200 bg-surface-50 px-4 py-4 dark:border-surface-800 dark:bg-surface-800/40 sm:flex-row sm:justify-end sm:px-6 [&>button]:w-full sm:[&>button]:w-auto">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Drawer;
