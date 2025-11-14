import React, { useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Toast notification component with auto-dismiss
 * @param {Object} props - Component props
 * @param {'success' | 'error' | 'warning' | 'info'} props.type - Toast type
 * @param {string} props.message - Toast message
 * @param {number} props.duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
 * @param {Function} props.onDismiss - Callback when toast is dismissed
 */
const Toast = React.memo(({ type = 'info', message, duration = 5000, onDismiss }) => {
  const timeoutRef = useRef(null);

  React.useEffect(() => {
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        onDismiss?.();
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [duration, onDismiss]);

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${typeStyles[type]} animate-slideIn`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="text-xl flex-shrink-0" aria-hidden="true">
        {iconMap[type]}
      </span>
      <p className="text-sm flex-1">{message}</p>
      <button
        onClick={onDismiss}
        className="text-lg hover:opacity-70 transition-opacity"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
});

Toast.displayName = 'Toast';

Toast.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  message: PropTypes.string.isRequired,
  duration: PropTypes.number,
  onDismiss: PropTypes.func,
};

export default Toast;
