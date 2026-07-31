import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-full bg-${variant}-100 dark:bg-${variant}-900/30 text-${variant}-600 dark:text-${variant}-400 shrink-0`}
        >
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-surface-600 dark:text-surface-300">
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
