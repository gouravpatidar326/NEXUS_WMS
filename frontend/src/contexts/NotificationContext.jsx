import { createContext, useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const notifySuccess = (message) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        borderRadius: '0.75rem',
        background: '#1e293b',
        color: '#fff',
      },
    });
  };

  const notifyError = (message) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        borderRadius: '0.75rem',
        background: '#ef4444',
        color: '#fff',
      },
    });
  };

  const notifyInfo = (message) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        borderRadius: '0.75rem',
        background: '#3b82f6',
        color: '#fff',
      },
    });
  };

  return (
    <NotificationContext.Provider
      value={{ notifySuccess, notifyError, notifyInfo, toast }}
    >
      {children}
      <Toaster />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};

export default NotificationContext;
