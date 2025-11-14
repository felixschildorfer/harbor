import { useState, useCallback } from 'react';
import Toast from '../components/Toast';

/**
 * Custom hook for managing toast notifications
 * Returns toast management functions and a ToastContainer component
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const ToastContainer = () => (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
      role="region"
      aria-live="polite"
      aria-label="Toast notifications"
    >
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onDismiss={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );

  return { addToast, removeToast, toasts, ToastContainer };
};
