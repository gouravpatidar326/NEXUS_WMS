import { createContext, useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const notifySuccess = (message) => {
    toast.success(message, { duration: 4000 });
  };

  const notifyError = (message) => {
    toast.error(message, { duration: 5000 });
  };

  const notifyInfo = (message) => {
    toast(message, {
      duration: 4000,
      icon: 'ℹ️',
    });
  };

  return (
    <NotificationContext.Provider value={{ notifySuccess, notifyError, notifyInfo, toast }}>
      {children}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: '!bg-white dark:!bg-slate-900 !text-slate-800 dark:!text-slate-100 !border !border-slate-200 dark:!border-slate-800 !shadow-xl !rounded-xl font-medium',
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};

export default NotificationContext;
